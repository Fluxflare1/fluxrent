import uuid
from django.db import models
from django.conf import settings
from django.utils.timezone import now


class ListingEngagement(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    listing = models.OneToOneField(
        "properties.PropertyListing",
        on_delete=models.CASCADE,
        related_name="engagement",
    )
    views = models.PositiveIntegerField(default=0)
    inspections = models.PositiveIntegerField(default=0)
    inquiries = models.PositiveIntegerField(default=0)  # From new code
    last_viewed = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def increment_views(self):
        # Using F() expression for atomic update (from new code)
        self.views = models.F("views") + 1
        self.last_viewed = now()
        self.save(update_fields=["views", "last_viewed", "updated_at"])

    def increment_inspections(self):
        # Using F() expression for atomic update (from new code)
        self.inspections = models.F("inspections") + 1
        self.save(update_fields=["inspections", "updated_at"])

    def increment_inquiries(self):
        # New method from new code
        self.inquiries = models.F("inquiries") + 1
        self.save(update_fields=["inquiries", "updated_at"])

    def __str__(self):
        # Enhanced to include inquiries while maintaining detail
        return f"Engagement for {self.listing.title}: {self.views} views, {self.inspections} inspections, {self.inquiries} inquiries"
