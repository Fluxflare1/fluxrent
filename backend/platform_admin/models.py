from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class AuditLog(models.Model):
    """
    Basic audit log for platform admin actions.
    """
    actor = models.ForeignKey(
        User, null=True, blank=True, on_delete=models.SET_NULL, related_name="admin_actions"
    )
    action = models.CharField(max_length=190)
    object_repr = models.CharField(max_length=512, blank=True)
    data = models.JSONField(null=True, blank=True)
    ip_address = models.CharField(max_length=60, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)
        verbose_name = "Audit Log"
        verbose_name_plural = "Audit Logs"

    def __str__(self):
        return f"{self.created_at.isoformat()} — {self.actor} — {self.action}"


class BroadcastTemplate(models.Model):
    """
    Templates used to send broadcast notifications via notifications app.
    """
    name = models.CharField(max_length=150, unique=True)
    subject = models.CharField(max_length=200, blank=True)
    body = models.TextField()
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        User, null=True, blank=True, on_delete=models.SET_NULL, related_name="created_broadcast_templates"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class PlatformSetting(models.Model):
    """
    Key-value settings for the platform (branding, feature flags etc.).
    """
    key = models.CharField(max_length=128, unique=True)
    value = models.JSONField()
    description = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.key
