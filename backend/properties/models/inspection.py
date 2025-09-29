# backend/properties/models/inspection.py
import uuid
from django.db import models
from django.conf import settings
from django.utils.timezone import now  # Added for potential future use


class InspectionBooking(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"
        COMPLETED = "COMPLETED", "Completed"
        CANCELLED = "CANCELLED", "Cancelled"  # Good addition from new code

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    listing = models.ForeignKey(
        "PropertyListing", 
        on_delete=models.CASCADE, 
        related_name="inspections"
    )
    unit = models.ForeignKey(
        "ApartmentUnit", 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name="inspections"
    )
    tenant = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="inspection_bookings"
    )
    scheduled_date = models.DateTimeField()
    status = models.CharField(
        max_length=20, 
        choices=Status.choices, 
        default=Status.PENDING
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)  # Added for consistency

    class Meta:
        ordering = ["-created_at"]
        indexes = [  # Added for better query performance
            models.Index(fields=["scheduled_date"]),
            models.Index(fields=["status"]),
            models.Index(fields=["tenant", "created_at"]),
        ]

    def __str__(self):
        # Consistent string representation
        unit_info = f" - {self.unit.name}" if self.unit else ""
        return f"Inspection for {self.listing.title}{unit_info} by {self.tenant} on {self.scheduled_date.strftime('%Y-%m-%d')}"

    def save(self, *args, **kwargs):
        """Optional: Add any inspection-specific save logic"""
        # Example: Auto-update engagement metrics
        super().save(*args, **kwargs)
