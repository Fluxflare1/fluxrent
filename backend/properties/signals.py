# backend/properties/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db import DatabaseError
import logging
from .models.listings import PropertyListing
from .models.inspection import InspectionBooking
from .models.engagement import ListingEngagement
from .services.search import SearchRankingService
from properties.models.boost import BoostPurchase
from .signals import update_listing_ranking  # careful with imports; update_listing_ranking already defined in this file

logger = logging.getLogger(__name__)


@receiver(post_save, sender=PropertyListing)
def create_listing_related_records(sender, instance, created, **kwargs):
    """
    Create all related records for a new PropertyListing and set initial ranking.
    """
    if created:
        # Create ListingEngagement if it doesn't exist
        if not hasattr(instance, 'engagement'):
            try:
                ListingEngagement.objects.create(listing=instance)
                logger.info(f"Created engagement record for listing {instance.id}")
            except DatabaseError as e:
                logger.error(f"Failed to create engagement for listing {instance.id}: {e}")
        
        # Set initial ranking score
        try:
            initial_score = SearchRankingService.calculate_total_ranking(instance)
            # Use update to avoid recursive signal
            PropertyListing.objects.filter(pk=instance.pk).update(ranking_score=initial_score)
            logger.info(f"Set initial ranking {initial_score} for listing {instance.id}")
        except Exception as e:
            logger.error(f"Failed to set initial ranking for listing {instance.id}: {e}")


@receiver(post_save, sender=InspectionBooking)
def handle_inspection_booking_engagement(sender, instance, created, **kwargs):
    """
    Handle inspection booking creation and update engagement metrics.
    """
    if created:
        listing = instance.listing
        
        # Update engagement metrics if engagement record exists
        if hasattr(listing, 'engagement'):
            try:
                listing.engagement.increment_inspections()
                logger.info(f"Incremented inspections for listing {listing.id}")
            except Exception as e:
                logger.error(f"Failed to increment inspections for listing {listing.id}: {e}")
        
        # Update ranking for the listing
        try:
            SearchRankingService.update_listing_ranking(listing)
        except Exception as e:
            logger.error(f"Failed to update ranking after inspection for listing {listing.id}: {e}")


@receiver(post_save, sender=BoostPurchase)
def handle_boost_activation(sender, instance, created, **kwargs):
    # When boost becomes success/update, update listing ranking score
    if instance.status == "success":
        try:
            update_listing_ranking(instance.listing)
        except Exception:
            pass
