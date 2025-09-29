import requests
from django.core.mail import send_mail
from django.conf import settings
from celery import shared_task
from .models import Dispute

SLACK_WEBHOOK_URL = settings.SLACK_WEBHOOK_URL

@shared_task
def notify_admins_of_dispute(dispute_id):
    try:
        dispute = Dispute.objects.get(id=dispute_id)

        # Slack alert
        if SLACK_WEBHOOK_URL:
            payload = {
                "text": f":rotating_light: New Dispute #{dispute.id}\n"
                        f"User: {dispute.user.username}\n"
                        f"Transaction: {dispute.transaction.reference}\n"
                        f"Status: {dispute.status}"
            }
            requests.post(SLACK_WEBHOOK_URL, json=payload)

        # Email alert
        send_mail(
            subject=f"New Dispute #{dispute.id}",
            message=f"A new dispute has been raised by {dispute.user.username}.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[admin[1] for admin in settings.ADMINS],
        )
    except Dispute.DoesNotExist:
        pass
