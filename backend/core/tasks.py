from celery import shared_task
from django.utils import timezone
from core.models import PlatformSettings
from .models import PropertyListing

@shared_task
def expire_free_posts():
    settings = PlatformSettings.objects.first()
    if not settings:
        return

    cutoff = timezone.now() - timezone.timedelta(days=settings.free_post_days)

    expired = PropertyListing.objects.filter(
        is_paid=False, posted_at__lt=cutoff, expires_at__isnull=True
    )

    for listing in expired:
        listing.expires_at = timezone.now()
        listing.save()
