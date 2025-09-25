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
        if listing.photos.exists():
            score += 0.3
        if listing.facilities:
            score += 0.2
        if listing.service_charge > 0:
            score += 0.1
        return min(score, 0.8)  # Cap completeness weight at 0.8

    @staticmethod
    def calculate_engagement_weight(listing):
        """Score based on engagement metrics: views & inspections."""
        if not hasattr(listing, "engagement"):
            return 0

        views = listing.engagement.views
        inspections = listing.engagement.inspections

        # Normalize engagement
        score = 0
        if views > 0:
            score += min(0.3, views / 1000)  # Max 0.3
        if inspections > 0:
            score += min(0.4, inspections / 100)  # Max 0.4

        return score

    @classmethod
    def calculate_total_ranking(cls, listing):
        recency = cls.calculate_recency_weight(listing.created_at)
        completeness = cls.calculate_completeness_weight(listing)
        engagement = cls.calculate_engagement_weight(listing)
        boost = getattr(listing, "optimization", None)
        boost_score = boost.boost_score / 100 if boost else 0

        # Weighted sum
        total = recency + completeness + engagement + boost_score
        return round(total, 4)
