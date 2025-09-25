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
    last_viewed = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def increment_views(self):
        self.views += 1
        self.last_viewed = now()
        self.save(update_fields=["views", "last_viewed", "updated_at"])

    def increment_inspections(self):
        self.inspections += 1
        self.save(update_fields=["inspections", "updated_at"])

    def __str__(self):
        return f"Engagement for {self.listing.title}: {self.views} views, {self.inspections} inspections"
