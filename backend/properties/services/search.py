# backend/properties/services/search.py
from django.utils.timezone import now
from datetime import timedelta


class SearchRankingService:
    @staticmethod
    def calculate_recency_weight(created_at):
        """Recent listings get higher weight (decays over 90 days)."""
        age_days = (now() - created_at).days
        return max(0.1, 1 - (age_days / 90))

    @staticmethod
    def calculate_completeness_weight(listing):
        """Score based on description, photos, facilities, service charge."""
        score = 0
        if listing.description:
            score += 0.2
        if listing.media.exists():  # Updated from photos to media
            score += 0.3
        if listing.facilities:
            score += 0.2
        if listing.service_charge and listing.service_charge > 0:
            score += 0.1
        return min(score, 0.8)  # Cap completeness weight at 0.8

    @staticmethod
    def calculate_engagement_weight(listing):
        """Score based on engagement metrics: views, inspections & inquiries."""
        if not hasattr(listing, "engagement"):
            return 0

        # Safe attribute access with defaults
        views = getattr(listing.engagement, "views", 0) or 0
        inspections = getattr(listing.engagement, "inspections", 0) or 0
        inquiries = getattr(listing.engagement, "inquiries", 0) or 0

        # Normalize engagement with different weights
        score = 0
        if views > 0:
            score += min(0.3, views / 1000)  # Max 0.3 for views
        if inspections > 0:
            score += min(0.3, inspections / 100)  # Max 0.3 for inspections
        if inquiries > 0:
            score += min(0.2, inquiries / 50)  # Max 0.2 for inquiries

        return min(score, 0.8)  # Cap total engagement at 0.8

    @staticmethod
    def calculate_boost_weight(listing):
        """Calculate boost score based on current boosting status."""
        # Check if listing is currently boosted
        if getattr(listing, "is_boosted", False):
            boost_until = getattr(listing, "boost_until", None)
            if boost_until and boost_until > now():
                return 0.3  # Fixed boost weight
        return 0

    @classmethod
    def calculate_total_ranking(cls, listing):
        """Calculate total ranking score with weighted components."""
        recency = cls.calculate_recency_weight(listing.created_at)
        completeness = cls.calculate_completeness_weight(listing)
        engagement = cls.calculate_engagement_weight(listing)
        boost = cls.calculate_boost_weight(listing)

        # Weighted sum (all components are 0-1 scaled)
        total = recency + completeness + engagement + boost
        
        # Ensure total doesn't exceed reasonable bounds
        return min(round(total, 4), 2.5)

    @classmethod
    def update_listing_ranking(cls, listing):
        """Update the ranking score for a specific listing."""
        try:
            ranking_score = cls.calculate_total_ranking(listing)
            # Use update to avoid triggering signals if not needed
            type(listing).objects.filter(pk=listing.pk).update(
                ranking_score=ranking_score
            )
            return ranking_score
        except Exception as e:
            # Log error but don't break the application
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error updating ranking for listing {listing.pk}: {e}")
            return 0

    @classmethod
    def batch_update_rankings(cls, listings=None):
        """Batch update rankings for multiple listings."""
        if listings is None:
            listings = PropertyListing.objects.all()
        
        updated_count = 0
        for listing in listings:
            try:
                ranking_score = cls.calculate_total_ranking(listing)
                if listing.ranking_score != ranking_score:
                    listing.ranking_score = ranking_score
                    listing.save(update_fields=['ranking_score'])
                    updated_count += 1
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error in batch update for listing {listing.pk}: {e}")
                continue
        
        return updated_count
