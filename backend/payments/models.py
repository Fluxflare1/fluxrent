# backend/payments/models.py
import uuid
from decimal import Decimal
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.db.models import Sum

def generate_uid(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:10].upper()}"


class PaymentRecord(models.Model):
    """
    Canonical Payment record used by the whole system.
    - invoice: nullable to allow prepayments/advances (payments not yet allocated).
    - tenant: user who owns/initiates the payment (for prepayments/ wallet)
    - confirmed_by: PM who confirmed manual payments when applicable
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
    # invoice is nullable to support prepayments (advance) not yet allocated to an invoice
    invoice = models.ForeignKey("bills.Invoice", on_delete=models.CASCADE, related_name="payments", null=True, blank=True)
    tenant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="payment_records")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    method = models.CharField(max_length=30, choices=PAYMENT_METHODS)
    reference = models.CharField(max_length=255, blank=True, null=True, help_text="External txn ref (gateway, bank, etc.)")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="success")
    # who confirmed (for manual/bank/cash). Could be PM or system account for gateway confirmations.
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
        Sums all successful PaymentRecord instances linked to this invoice and marks it paid when total >= invoice.total_amount.
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
        Apply (part of) this payment (prepayment) to an invoice.
        - If this PaymentRecord already has an invoice (non-prepayment), raising is safer.
        - This creates a new PaymentRecord referencing the target invoice and reduces this record amount accordingly,
          or marks it fully applied (we'll record applications by splitting records).
        Returns: (applied_record, remainder_record_or_none)
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

        # Create a new payment record attached to the invoice representing allocation
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

        # Reduce or delete the original (prepayment) record amount
        remainder = self.amount - apply_amount
        if remainder <= 0:
            # fully consumed: mark original as applied/zeroed out (we keep it but set amount to 0 and optionally annotate)
            self.amount = Decimal("0")
            # Keep original as historical prepayment with amount 0 (could add a field 'is_consumed' if desired)
            self.save(update_fields=["amount"])
            return applied, None
        else:
            # partially consumed: adjust original amount
            self.amount = remainder
            self.save(update_fields=["amount"])
            return applied, self
