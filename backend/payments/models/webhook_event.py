from django.db import models
from django.utils import timezone

class WebhookEvent(models.Model):
    EVENT_STATUS = [
        ("pending", "Pending"),
        ("processed", "Processed"),
        ("failed", "Failed"),
    ]

    event_id = models.CharField(max_length=255, unique=True)
    event_type = models.CharField(max_length=100)
    payload = models.JSONField()
    status = models.CharField(max_length=20, choices=EVENT_STATUS, default="pending")
    received_at = models.DateTimeField(default=timezone.now)
    processed_at = models.DateTimeField(null=True, blank=True)

    def mark_processed(self, success=True):
        self.status = "processed" if success else "failed"
        self.processed_at = timezone.now()
        self.save()
