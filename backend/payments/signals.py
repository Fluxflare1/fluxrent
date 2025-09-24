# backend/payments/signals.py
from decimal import Decimal
from django.db import transaction
from django.dispatch import receiver
from django.db.models.signals import post_save
from bills.models import Invoice
from .models import Prepayment, PaymentRecord, PaymentAllocation
from django.utils import timezone
from django.conf import settings


@receiver(post_save, sender=Invoice)
def auto_apply_prepayments_on_invoice_creation(sender, instance: Invoice, created, **kwargs):
    """
    When a new Invoice is created (and not paid), attempt to apply available prepayments
    from the tenant automatically in FIFO order until the invoice is fully or partially settled.
    """
    if not created:
        return

    invoice = instance
    if getattr(invoice, "is_paid", False):
        return

    tenant = getattr(invoice.tenant_apartment, "tenant", None)
    if tenant is None:
        return

    # Find active prepayments with remaining > 0 for this tenant, ordered oldest-first
    prepayments = Prepayment.objects.filter(tenant=tenant, is_active=True, remaining__gt=Decimal("0.00")).order_by("created_at")
    if not prepayments.exists():
        return

    # Apply prepayments in a transaction
    remaining_due = Decimal(invoice.total_amount)
    with transaction.atomic():
        for pre in prepayments:
            if remaining_due <= Decimal("0.00"):
                break
            apply_amount = min(pre.remaining, remaining_due)
            actual = pre.apply(invoice, apply_amount)
            if actual > Decimal("0.00"):
                # Create a PaymentRecord representing the applied amount on invoice
                PaymentRecord.objects.create(
                    invoice=invoice,
                    tenant=tenant,
                    amount=actual,
                    method="wallet_auto" if pre.reference is None else "wallet_auto",
                    reference=pre.reference,
                    status="success",
                    confirmed_by=None,
                    confirmed_at=timezone.now()
                )
                remaining_due = (remaining_due - actual).quantize(Decimal("0.01"))

        # After applying allocations, mark invoice if fully paid
        paid_sum = PaymentRecord.objects.filter(invoice=invoice, status="success").aggregate(total=models.Sum("amount"))["total"] or 0
        if paid_sum >= invoice.total_amount:
            invoice.is_paid = True
            invoice.save(update_fields=["is_paid"])
