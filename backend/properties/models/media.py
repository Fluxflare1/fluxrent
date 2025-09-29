# backend/properties/models/media.py
import uuid
from django.db import models
from django.utils.timezone import now


class PropertyMedia(models.Model):
    class MediaType(models.TextChoices):  # Changed to class-based for consistency
        IMAGE = "image", "Image"
        VIDEO = "video", "Video"
        DOCUMENT = "document", "Document"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    listing = models.ForeignKey(
        "PropertyListing", 
        on_delete=models.CASCADE, 
        related_name="media"
    )
    media_type = models.CharField(
        max_length=16, 
        choices=MediaType.choices, 
        default=MediaType.IMAGE
    )
    file = models.FileField(upload_to="properties/media/")
    caption = models.CharField(max_length=255, blank=True)
    is_cover = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)  # Added for manual ordering
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)  # Added for consistency

    class Meta:
        ordering = ["order", "-created_at"]  # Enhanced ordering
        indexes = [
            models.Index(fields=["listing", "media_type"]),
            models.Index(fields=["listing", "is_cover"]),
        ]

    def __str__(self):
        media_info = f" ({self.caption})" if self.caption else ""
        return f"{self.media_type} for {self.listing.title}{media_info}"

    def save(self, *args, **kwargs):
        """Handle cover photo logic"""
        # If this is set as cover, unset other cover photos for the same listing
        if self.is_cover:
            PropertyMedia.objects.filter(
                listing=self.listing, 
                is_cover=True
            ).exclude(id=self.id).update(is_cover=False)
        super().save(*args, **kwargs)
