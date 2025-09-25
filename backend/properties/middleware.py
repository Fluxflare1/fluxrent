from django.utils.deprecation import MiddlewareMixin
from django.urls import resolve
from properties.models.listings import PropertyListing
from properties.signals import update_listing_ranking


class ListingViewTrackingMiddleware(MiddlewareMixin):
    def process_view(self, request, view_func, view_args, view_kwargs):
        match = resolve(request.path)
        if match.url_name == "listing-detail" and request.method == "GET":
            listing_id = view_kwargs.get("pk")
            try:
                listing = PropertyListing.objects.get(pk=listing_id)
                if hasattr(listing, "engagement"):
                    listing.engagement.increment_views()
                    update_listing_ranking(listing)
            except PropertyListing.DoesNotExist:
                pass
        return None
