# backend/disputes/signals.py
import json
import requests
from django.dispatch import receiver
from django.db.models.signals import post_save
from django.conf import settings
from django.core.mail import send_mail
from .models import Dispute, DisputeAuditTrail
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

SLACK_WEBHOOK = getattr(settings, "SLACK_WEBHOOK_URL", None)
DEFAULT_FROM = getattr(settings, "DEFAULT_FROM_EMAIL", None)
ADMIN_ALERT_EMAILS = getattr(settings, "ADMIN_ALERT_EMAILS", [])  # list of admin emails

def _send_slack_alert(text: str):
    if not SLACK_WEBHOOK:
        return False
    try:
        payload = {"text": text}
        requests.post(SLACK_WEBHOOK, json=payload, timeout=10)
    except Exception:
        # log in production
        return False
    return True

def _send_email_subject_body(subject: str, body: str, recipients: list):
    if not DEFAULT_FROM or not recipients:
        return False
    try:
        send_mail(subject, body, DEFAULT_FROM, recipients, fail_silently=False)
    except Exception:
        # log in production
        return False
    return True

@receiver(post_save, sender=Dispute)
def on_dispute_created(sender, instance: Dispute, created: bool, **kwargs):
    # Create audit entry (creator may be set in view)
    if created:
        DisputeAuditTrail.objects.create(
            dispute=instance,
            actor=instance.user,
            action="created",
            data={"transaction_reference": instance.transaction_reference, "amount": str(instance.amount) if instance.amount else None},
        )

        # Slack alert
        text = f"*New Dispute:* {instance.uid}\nUser: {instance.user.email}\nReason: {instance.reason[:200]}\nAmount: {instance.amount}\nRef: {instance.transaction_reference}"
        _send_slack_alert(text)

        # Email alert to admins
        if ADMIN_ALERT_EMAILS:
            subject = f"[FluxRent] New Dispute {instance.uid}"
            body = f"New dispute {instance.uid}\nUser: {instance.user.email}\nAmount: {instance.amount}\nRef: {instance.transaction_reference}\n\nReason:\n{instance.reason}\n\nOpen admin: /admin/disputes/dispute/{instance.id}/change/"
            _send_email_subject_body(subject, body, ADMIN_ALERT_EMAILS)



@receiver(post_save, sender=Dispute)
def notify_new_dispute(sender, instance, created, **kwargs):
    if created:
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "disputes",
            {
                "type": "dispute_created",
                "id": instance.id,
                "user": instance.user.username,
                "status": instance.status,
                "created_at": instance.created_at.isoformat(),
            },
        )



from .tasks import notify_admins_of_dispute

@receiver(post_save, sender=Dispute)
def notify_new_dispute(sender, instance, created, **kwargs):
    if created:
        # Broadcast to WebSocket group
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "disputes",
            {
                "type": "dispute_created",
                "id": instance.id,
                "user": instance.user.username,
                "status": instance.status,
                "created_at": instance.created_at.isoformat(),
            },
        )
        # Trigger async Slack/Email notifications
        notify_admins_of_dispute.delay(instance.id)
