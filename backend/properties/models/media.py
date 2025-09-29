# backend/properties/models/media.py
import uuid
from django.db import models

class PropertyMedia(models.Model):
    MEDIA_TYPE = [("image", "Image"), ("video", "Video"), ("document", "Document")]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    listing = models.ForeignKey("PropertyListing", on_delete=models.CASCADE, related_name="media")
    media_type = models.CharField(max_length=16, choices=MEDIA_TYPE, default="image")
    file = models.FileField(upload_to="properties/media/")
    caption = models.CharField(max_length=255, blank=True)
    is_cover = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
