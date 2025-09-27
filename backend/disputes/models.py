# backend/disputes/models.py
import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone

def gen_uid(prefix: str):
    return f"{prefix}-{uuid.uuid4().hex[:10].upper()}"

class Dispute(models.Model):
    STATUS_CHOICES = [
        ("OPEN", "Open"),
        ("PENDING", "Pending"),
        ("RESOLVED", "Resolved"),
        ("REJECTED", "Rejected"),
    ]

    uid = models.CharField(max_length=32, unique=True, default=lambda: gen_uid("DSP"))
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="disputes")
    transaction_reference = models.CharField(max_length=255, blank=True, null=True)
    amount = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="OPEN")
    metadata = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="assigned_disputes")

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["uid"]),
            models.Index(fields=["transaction_reference"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self):
        return f"{self.uid} - {self.user.email} - {self.status}"

class DisputeAuditTrail(models.Model):
    dispute = models.ForeignKey(Dispute, on_delete=models.CASCADE, related_name="audits")
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="dispute_audits")
    action = models.CharField(max_length=255)
    data = models.JSONField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]
        indexes = [
            models.Index(fields=["dispute"]),
        ]

    def __str__(self):
        return f"Audit {self.dispute.uid} @ {self.timestamp}"
