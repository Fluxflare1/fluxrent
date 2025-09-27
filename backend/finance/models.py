# backend/finance/models.py
from decimal import Decimal
import uuid

from django.conf import settings
from django.db import models
from django.utils import timezone


def generate_uid(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:12].upper()}"


class FeeConfig(models.Model):
    """
    Configuration for fees by transaction channel/type.
    Example rows:
      - channel = 'paystack', percent=1.5, fixed=50 (NGN)
      - channel = 'transfer', percent=0.5, fixed=10 (platform ledger fee)
    """
    CHANNEL_CHOICES = [
        ("paystack", "Paystack"),
        ("wallet_transfer", "Wallet Transfer"),
        ("withdrawal", "Withdrawal"),
        ("platform", "Platform"),
    ]

    channel = models.CharField(max_length=50, choices=CHANNEL_CHOICES, unique=True)
    percent = models.DecimalField(max_digits=6, decimal_places=3, default=Decimal("0.00"),
                                  help_text="percentage fee, e.g. 1.5 = 1.5%")
    fixed = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"),
                                help_text="fixed fee component in currency")
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["channel"]

    def __str__(self):
        return f"{self.channel} fee: {self.percent}% + {self.fixed}"


class TransactionAudit(models.Model):
    """
    Canonical audit record for every money movement in the system.
    It is created by signals when WalletTransaction or PaymentRecord is created.
    """
    STATUS_CHOICES = [("pending", "Pending"), ("success", "Success"), ("failed", "Failed")]

    uid = models.CharField(max_length=32, unique=True, default=lambda: generate_uid("TA"))
    # optional link to wallet transaction (nullable to avoid circular import issues)
    wallet_transaction_id = models.CharField(max_length=64, null=True, blank=True)
    payment_record_id = models.CharField(max_length=64, null=True, blank=True)
    # canonical references
    source_wallet_uid = models.CharField(max_length=64, null=True, blank=True)
    destination_wallet_uid = models.CharField(max_length=64, null=True, blank=True)
    invoice_uid = models.CharField(max_length=64, null=True, blank=True)
    tenant_id = models.CharField(max_length=64, null=True, blank=True)

    channel = models.CharField(max_length=64, help_text="e.g. paystack, wallet_transfer, withdrawal")
    gross_amount = models.DecimalField(max_digits=18, decimal_places=2, default=Decimal("0.00"))
    fee_amount = models.DecimalField(max_digits=18, decimal_places=2, default=Decimal("0.00"))
    net_amount = models.DecimalField(max_digits=18, decimal_places=2, default=Decimal("0.00"))
    currency = models.CharField(max_length=8, default="NGN")
    reference = models.CharField(max_length=255, null=True, blank=True)  # external gateway ref
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    meta = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["uid"]),
            models.Index(fields=["reference"]),
            models.Index(fields=["channel"]),
        ]

    def mark_success(self):
        self.status = "success"
        self.save(update_fields=["status", "updated_at"])

    def mark_failed(self, reason: str = None):
        self.status = "failed"
        if reason:
            self.notes = (self.notes or "") + f"\n{timezone.now().isoformat()}: {reason}"
        self.save(update_fields=["status", "notes", "updated_at"])

    def __str__(self):
        return f"{self.uid} {self.channel} {self.gross_amount} ({self.status})"


class Dispute(models.Model):
    """
    Dispute raised by a user for a transaction.
    Admins can examine and resolve.
    """
    STATUS = [("open", "Open"), ("investigating", "Investigating"), ("resolved", "Resolved"), ("rejected", "Rejected")]
    RESOLUTION = [("refund", "Refund to user"), ("no_action", "No action"), ("other", "Other")]

    uid = models.CharField(max_length=32, unique=True, default=lambda: generate_uid("DSP"))
    transaction = models.ForeignKey(TransactionAudit, on_delete=models.CASCADE, related_name="disputes")
    raised_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="disputes")
    reason = models.TextField()
    evidence = models.JSONField(blank=True, null=True, help_text="optional links / screenshots")
    status = models.CharField(max_length=30, choices=STATUS, default="open")
    resolution = models.CharField(max_length=30, choices=RESOLUTION, blank=True, null=True)
    resolution_note = models.TextField(blank=True, null=True)
    resolved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="resolved_disputes")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["uid"]), models.Index(fields=["status"])]

    def __str__(self):
        return f"Dispute {self.uid} - {self.status}"
