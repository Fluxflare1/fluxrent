# backend/properties/tasks.py
from celery import shared_task
from django.utils import timezone
from django.db.models import Q
from properties.models.listings import PropertyListing
from properties.models.boost import PlatformSetting
from properties.signals import update_listing_ranking

@shared_task
def recalc_all_listing_rankings(batch_size=500):
    """
    Recompute ranking_score for all listings. This is scheduled daily.
    """
    from properties.services.search import SearchRankingService
    qs = PropertyListing.objects.filter(is_published=True)
    total = qs.count()
    page = 0
    while True:
        listings = qs[page * batch_size:(page + 1) * batch_size]
        if not listings:
            break
        for listing in listings:
            try:
                score = SearchRankingService.calculate_total_ranking(listing)
                if listing.ranking_score != score:
                    listing.ranking_score = score
                    listing.save(update_fields=["ranking_score"])
            except Exception:
                # swallow to avoid stopping worker; monitor logs
                pass
        page += 1
        if page * batch_size >= total:
            break

@shared_task
def expire_free_posts():
    """
    Unpublish or remove media for listings that exceeded free posting period.
    Admin controls setting key 'free_post_days' in PlatformSetting.
    """
    try:
        setting = PlatformSetting.objects.filter(key="posting").first()
        free_days = 7
        if setting:
            val = setting.value or {}
            free_days = int(val.get("free_post_days", free_days))
    except Exception:
        free_days = 7

    threshold = timezone.now() - timezone.timedelta(days=free_days)
    # Find published listings whose created_at < threshold and have no active boost / paid promotion
    expired = PropertyListing.objects.filter(is_published=True, created_at__lte=threshold).exclude(
        boost_purchases__status="success", boost_purchases__ends_at__gte=timezone.now()
    )
    for listing in expired:
        # Policy: unpublish listing and optionally remove images (admin controlled)
        listing.is_published = False
        listing.save(update_fields=["is_published"])
        # optionally: remove images if admin setting says so (not implemented here but easy to add)
