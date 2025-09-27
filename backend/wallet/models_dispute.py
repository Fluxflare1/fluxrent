# backend/wallet/models_dispute.py
import uuid
from decimal import Decimal
from django.db import models
from django.conf import settings
from django.utils import timezone

from wallet.models import WalletTransaction, Wallet  # import existing models

def generate_uid(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:12].upper()}"

class Dispute(models.Model):
    """
    Dispute raised by a user about a transaction/payment.
    Can reference a WalletTransaction or (optionally) a PaymentRecord via string to avoid import cycles.
    """
    STATUS = [
        ("open", "Open"),
        ("under_review", "Under Review"),
        ("resolved", "Resolved"),
        ("rejected", "Rejected"),
        ("refunded", "Refunded"),
    ]

    uid = models.CharField(max_length=40, unique=True, default=lambda: generate_uid("DSP"))
    raised_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="disputes")
    wallet_transaction = models.ForeignKey(
        WalletTransaction,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="disputes",
        help_text="The wallet transaction under dispute (if applicable)"
    )
    # keep invoice/payment link optional (string) to avoid cycles
    payment_reference = models.CharField(max_length=255, blank=True, null=True, help_text="Optional external/payment ref")
    amount = models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True)
    reason = models.TextField()
    evidence = models.FileField(upload_to="dispute_evidence/", null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS, default="open")
    resolution_note = models.TextField(blank=True, null=True)
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="resolved_disputes"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["uid"]),
            models.Index(fields=["status"]),
            models.Index(fields=["raised_by"]),
        ]

    def __str__(self):
        tx_info = f"tx={self.wallet_transaction.uid}" if self.wallet_transaction else f"ref={self.payment_reference}"
        return f"{self.uid} ({self.status}) by {self.raised_by} - {tx_info}"

    def mark_resolved(self, status: str, note: str = "", user=None):
        self.status = status
        self.resolution_note = note
        self.resolved_by = user
        self.resolved_at = timezone.now()
        self.save(update_fields=["status", "resolution_note", "resolved_by", "resolved_at", "updated_at"])


class DisputeComment(models.Model):
    """
    Comments on disputes for audit trail & communication between user/admins.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    dispute = models.ForeignKey(Dispute, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="dispute_comments")
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    internal = models.BooleanField(default=False, help_text="Internal notes visible only to admins")

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Comment by {self.author} on {self.dispute.uid}"
