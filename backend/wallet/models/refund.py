from django.db import models
from django.conf import settings
from django.utils import timezone

class Refund(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
        ("completed", "Completed"),
    ]

    transaction = models.OneToOneField(
        "wallet.Transaction",
        on_delete=models.CASCADE,
        related_name="refund",
        help_text="Original transaction being refunded"
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    charge = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_refund = models.DecimalField(max_digits=12, decimal_places=2, help_text="Amount + charge")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="refund_requests"
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="refund_approvals"
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Refund {self.id} for Txn {self.transaction.reference}"

    @property
    def is_completed(self):
        return self.status == "completed"
