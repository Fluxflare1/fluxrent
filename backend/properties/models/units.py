# backend/properties/models/units.py
import uuid
from django.db import models
from django.conf import settings
from decimal import Decimal
from django.core.validators import MinValueValidator


def generate_unit_uid():
    return f"APT-{uuid.uuid4().hex[:10].upper()}"


class ApartmentUnit(models.Model):
    APARTMENT_TYPE = [
        ("ONE_ROOM", "One Room"),
        ("SELF_CONTAINED", "Self Contained"),
        ("FLAT", "Flat"),
        ("DUPLEX", "Duplex"),
        ("HALL", "Hall"),
        ("LAND", "Land"),
        ("SERVICE_UNIT", "Service Unit"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    uid = models.CharField(max_length=30, unique=True, default=generate_unit_uid, editable=False)
    listing = models.ForeignKey("PropertyListing", on_delete=models.CASCADE, related_name="units")
    apartment_type = models.CharField(max_length=30, choices=APARTMENT_TYPE)
    name = models.CharField(max_length=120, blank=True)  # e.g., Flat A1
    floor = models.CharField(max_length=64, blank=True)
    rooms = models.PositiveIntegerField(default=1)
    bedrooms = models.PositiveIntegerField(default=1)
    bathrooms = models.PositiveIntegerField(default=1)
    toilets = models.PositiveIntegerField(default=1)
    ensuites = models.BooleanField(default=False)
    visitors_toilet = models.BooleanField(default=False)
    rent_amount = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0.00"), validators=[MinValueValidator(Decimal("0.00"))])
    lease_amount = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0.00"))
    # additional per-unit metadata
    facilities = models.JSONField(default=list, blank=True)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["listing", "name"]
        indexes = [models.Index(fields=["uid"]), models.Index(fields=["listing"])]

    def __str__(self):
        return f"{self.name or self.uid} ({self.listing.title})"
