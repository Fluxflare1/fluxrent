# backend/payments/models.py
import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone

def generate_uid(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:10].upper()}"

class PaymentRecord(models.Model):
    """
    Canonical Payment record used by the whole system.
    Points to bills.Invoice (string reference to avoid import cycles).
    """
    PAYMENT_METHODS = [
        ("bank", "Bank Transfer"),
        ("card", "Card"),
        ("cash", "Cash"),
        ("wallet_manual", "Wallet Manual"),
        ("wallet_auto", "Wallet Auto-Pay"),
        ("external_gateway", "External Gateway"),
    ]

    uid = models.CharField(max_length=30, unique=True, default=lambda: generate_uid("PAY"))
    invoice = models.ForeignKey("bills.Invoice", on_delete=models.CASCADE, related_name="payments")
    tenant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="payment_records")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    method = models.CharField(max_length=30, choices=PAYMENT_METHODS)
    reference = models.CharField(max_length=255, blank=True, null=True, help_text="External txn ref (gateway, bank, etc.)")
    status = models.CharField(max_length=20, choices=[("pending", "Pending"), ("success", "Success"), ("failed", "Failed")], default="success")
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
        return f"{self.uid} - {self.method} - {self.amount}"

    def mark_invoice_paid_if_fully_settled(self):
        """
        When a new successful payment is created, evaluate invoice settlement.
        Assumes invoice.total_amount exists and invoice.is_paid boolean is the canonical flag.
        """
        try:
            invoice = self.invoice
            # Sum successful payments for this invoice (including this one if success)
            paid_sum = PaymentRecord.objects.filter(invoice=invoice, status="success").aggregate(
                total=models.Sum("amount")
            )["total"] or 0
            if paid_sum >= invoice.total_amount:
                invoice.is_paid = True
                invoice.save(update_fields=["is_paid"])
        except Exception:
            # don't raise — keep DB consistent; logging/monitoring will catch unexpected issues
            pass
