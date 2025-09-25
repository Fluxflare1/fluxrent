from django.db.models.signals import post_save
from django.dispatch import receiver
from .models.listings import PropertyListing, SearchOptimization, InspectionBooking
from .models.engagement import ListingEngagement
from .services.search import SearchRankingService


@receiver(post_save, sender=PropertyListing)
def create_listing_related_records(sender, instance, created, **kwargs):
    """
    Single signal handler to create all related records for a new PropertyListing.
    Replaces duplicate signal handlers.
    """
    if created:
        # Create SearchOptimization if it doesn't exist
        if not hasattr(instance, 'optimization'):
            SearchOptimization.objects.create(listing=instance)
        
        # Create ListingEngagement if it doesn't exist  
        if not hasattr(instance, 'engagement'):
            ListingEngagement.objects.create(listing=instance)


@receiver(post_save, sender=InspectionBooking)
def handle_inspection_booking_engagement(sender, instance, created, **kwargs):
    """
    Handle inspection booking creation and update engagement metrics.
    """
    if created and instance.status == InspectionBooking.Status.PENDING:
        listing = instance.listing
        
        # Update engagement metrics if engagement record exists
        if hasattr(listing, 'engagement'):
            listing.engagement.increment_inspections()
        
        # Always update ranking regardless of engagement record
        update_listing_ranking(listing)


def update_listing_ranking(listing):
    """
    Centralized function to update listing ranking score.
    Reusable across different signals and services.
    """
    try:
        score = SearchRankingService.calculate_total_ranking(listing)
        # Only update if the score has changed to avoid unnecessary DB writes
        if listing.ranking_score != score:
            listing.ranking_score = score
            listing.save(update_fields=["ranking_score"])
    except Exception as e:
        # Log the error in production; consider using logging.getLogger(__name__)
        # logger.error(f"Failed to update ranking for listing {listing.id}: {str(e)}")
        pass  # Fail silently in signal to prevent transaction issues


