from django.db import models
from django.utils import timezone

class AuditLog(models.Model):
    ACTION_CHOICES = [
        ("payment_success", "Payment Success"),
        ("payment_failed", "Payment Failed"),
        ("reconciliation", "Reconciliation"),
        ("discrepancy", "Discrepancy"),
    ]

    reference = models.CharField(max_length=100, db_index=True)
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    details = models.JSONField()
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.reference} - {self.action}"
