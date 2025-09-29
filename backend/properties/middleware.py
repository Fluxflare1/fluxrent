# backend/properties/middleware.py
from django.utils.deprecation import MiddlewareMixin
from django.urls import resolve
from django.db import DatabaseError
import logging
from .models.listings import PropertyListing
from .services.search import SearchRankingService

logger = logging.getLogger(__name__)


class ListingViewTrackingMiddleware(MiddlewareMixin):
    """
    Middleware to track property listing views and update engagement metrics.
    """
    
    def process_view(self, request, view_func, view_args, view_kwargs):
        """
        Track listing views and update engagement metrics.
        """
        # Skip for non-GET requests
        if request.method != "GET":
            return None

        try:
            match = resolve(request.path_info)
        except Exception:
            return None

        # Track listing detail views
        if match.url_name == "listing-detail":
            listing_id = view_kwargs.get("pk") or view_kwargs.get("id")
            
            if not listing_id:
                return None

            try:
                listing = PropertyListing.objects.select_related('engagement').get(pk=listing_id)
                self._update_listing_engagement(listing)
            except PropertyListing.DoesNotExist:
                pass
            except Exception as e:
                logger.error(f"Error tracking listing view: {e}")
            
        return None

    def _update_listing_engagement(self, listing):
        """
        Update engagement metrics and ranking for a listing.
        """
        if hasattr(listing, "engagement"):
            listing.engagement.increment_views()
            SearchRankingService.update_listing_ranking(listing)
