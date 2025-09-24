import uuid
from decimal import Decimal
from django.db import models, transaction
from django.conf import settings
from django.utils import timezone
from django.db.models import Sum

def generate_uid(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:10].upper()}"


class Prepayment(models.Model):
    """
    A prepayment (fund) created by a user that sits as available balance
    until applied to an invoice.
    """
    uid = models.CharField(max_length=40, unique=True, default=lambda: generate_uid("PRE"))
    tenant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="prepayments")
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    remaining = models.DecimalField(max_digits=14, decimal_places=2)
    reference = models.CharField(max_length=255, blank=True, null=True, help_text="External reference (gateway/bank/ref)")
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["tenant"]),
            models.Index(fields=["uid"]),
        ]

    def __str__(self):
        return f"Prepayment {self.uid} - {self.tenant} - {self.remaining}/{self.amount}"

    def apply(self, invoice, amount):
        """
        Apply up to `amount` from this prepayment to the given invoice.
        Returns the actual applied Decimal amount.
        """
        if not self.is_active or self.remaining <= Decimal("0.00"):
            return Decimal("0.00")

        to_apply = min(self.remaining, Decimal(amount))
        if to_apply <= Decimal("0.00"):
            return Decimal("0.00")

        # Create allocation record
        allocation = PaymentAllocation.objects.create(
            prepayment=self,
            invoice=invoice,
            amount=to_apply,
            allocated_at=timezone.now(),
        )

        # Decrement remaining
        self.remaining = (self.remaining - to_apply).quantize(Decimal("0.01"))
        if self.remaining <= Decimal("0.00"):
            self.remaining = Decimal("0.00")
            self.is_active = False
        self.save(update_fields=["remaining", "is_active"])
        return to_apply


class PaymentRecord(models.Model):
    """
    Canonical Payment record used by the whole system.
    """
    PAYMENT_METHODS = [
        ("bank", "Bank Transfer"),
        ("card", "Card"),
        ("cash", "Cash"),
        ("wallet_manual", "Wallet Manual"),
        ("wallet_auto", "Wallet Auto-Pay"),
        ("external_gateway", "External Gateway"),
    ]

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("success", "Success"),
        ("failed", "Failed"),
    ]

    uid = models.CharField(max_length=30, unique=True, default=lambda: generate_uid("PAY"))
    # invoice is nullable to support legacy prepayments during migration
    invoice = models.ForeignKey("bills.Invoice", on_delete=models.CASCADE, related_name="payments", null=True, blank=True)
    tenant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="payment_records")
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    method = models.CharField(max_length=30, choices=PAYMENT_METHODS)
    reference = models.CharField(max_length=255, blank=True, null=True, help_text="External txn ref (gateway, bank, etc.)")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="success")
    confirmed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="confirmed_payments",
        help_text="If manual/bank/cash, PM who confirmed"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["uid"]),
            models.Index(fields=["invoice"]),
            models.Index(fields=["tenant"]),
        ]

    def __str__(self):
        invoice_uid = self.invoice.uid if self.invoice else "PREPAY"
        return f"{self.uid} - {invoice_uid} - {self.method} - {self.amount}"

    def mark_invoice_paid_if_fully_settled(self):
        """
        When a new successful payment is created, evaluate invoice settlement.
        """
        if not self.invoice:
            return
        try:
            invoice = self.invoice
            paid_sum = PaymentRecord.objects.filter(invoice=invoice, status="success").aggregate(
                total=Sum("amount")
            )["total"] or Decimal("0")
            if paid_sum >= invoice.total_amount:
                invoice.is_paid = True
                invoice.save(update_fields=["is_paid"])
        except Exception:
            # Keep tolerant; log externally if needed
            pass

    def apply_to_invoice(self, invoice, amount=None):
        """
        Legacy method for backward compatibility during migration.
        Use Prepayment.apply() for new code.
        """
        if self.invoice:
            raise ValueError("This payment record is already attached to an invoice.")

        if self.status != "success":
            raise ValueError("Only successful payments can be applied.")

        invoice_amount_remaining = (invoice.total_amount or Decimal("0")) - (PaymentRecord.objects.filter(invoice=invoice, status="success").aggregate(total=Sum("amount"))["total"] or Decimal("0"))
        if invoice_amount_remaining <= 0:
            raise ValueError("Invoice already settled.")

        apply_amount = Decimal(amount) if amount is not None else min(self.amount, invoice_amount_remaining)
        if apply_amount <= 0:
            raise ValueError("apply amount must be positive.")

        # Create a new payment record attached to the invoice
        applied = PaymentRecord.objects.create(
            invoice=invoice,
            tenant=self.tenant,
            amount=apply_amount,
            method=self.method,
            reference=self.reference,
            status="success",
            confirmed_by=self.confirmed_by,
            confirmed_at=self.confirmed_at,
        )

        # Reduce or delete the original record amount
        remainder = self.amount - apply_amount
        if remainder <= 0:
            self.amount = Decimal("0")
            self.save(update_fields=["amount"])
            return applied, None
        else:
            self.amount = remainder
            self.save(update_fields=["amount"])
            return applied, self


class PaymentAllocation(models.Model):
    """
    Records application of a Prepayment to an Invoice (audit trail).
    """
    uid = models.CharField(max_length=40, unique=True, default=lambda: generate_uid("PAL"))
    prepayment = models.ForeignKey(Prepayment, on_delete=models.CASCADE, related_name="allocations")
    invoice = models.ForeignKey("bills.Invoice", on_delete=models.CASCADE, related_name="allocations")
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    allocated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-allocated_at"]
        indexes = [
            models.Index(fields=["prepayment"]),
            models.Index(fields=["invoice"]),
        ]

    def __str__(self):
        return f"Alloc {self.uid} - {self.prepayment.uid} -> {self.invoice.uid} : {self.amount}"
