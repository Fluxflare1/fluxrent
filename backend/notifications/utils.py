import requests
from django.core.mail import send_mail
from django.conf import settings

def notify_admins(subject, message):
    """
    Send Slack + Email notifications to admins.
    """

    # Slack Notification
    slack_url = getattr(settings, "SLACK_WEBHOOK_URL", None)
    if slack_url:
        try:
            requests.post(slack_url, json={"text": f"*{subject}*\n{message}"}, timeout=5)
        except Exception:
            pass

    # Email Notification
    admin_emails = getattr(settings, "ADMIN_EMAILS", [])
    if admin_emails:
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                admin_emails,
                fail_silently=True,
            )
        except Exception:
            pass
