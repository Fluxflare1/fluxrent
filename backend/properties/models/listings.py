import uuid
from django.conf import settings
from django.contrib.gis.db import models
from django.utils.text import slugify
from django.utils.timezone import now


class PropertyListing(models.Model):
    class ListingType(models.TextChoices):
        RENT = "RENT", "Rent"
        LEASE = "LEASE", "Lease"
        SALE = "SALE", "Sale"
        SERVICE_APARTMENT = "SERVICE_APARTMENT", "Service Apartment"
        LAND = "LAND", "Land"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    property_uid = models.CharField(max_length=50, unique=True, editable=False)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="owned_listings",
    )
    agent = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="agent_listings",
    )
    listing_type = models.CharField(max_length=30, choices=ListingType.choices)
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, blank=True, editable=False)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    service_charge = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    bedrooms = models.PositiveIntegerField(default=0)
    bathrooms = models.PositiveIntegerField(default=0)
    toilets = models.PositiveIntegerField(default=0)
    facilities = models.JSONField(default=list, blank=True)
    location = models.PointField(geography=True)
    is_published = models.BooleanField(default=False)
    ranking_score = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.property_uid:
            self.property_uid = f"{slugify(self.listing_type)}-{uuid.uuid4().hex[:8]}"
        if not self.slug:
            self.slug = slugify(self.title)[:50]
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} - {self.property_uid}"


class ListingPhoto(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    listing = models.ForeignKey(
        PropertyListing, on_delete=models.CASCADE, related_name="photos"
    )
    image = models.ImageField(upload_to="listing_photos/")
    caption = models.CharField(max_length=255, blank=True)
    is_cover = models.BooleanField(default=False)

    def __str__(self):
        return f"Photo for {self.listing.title}"


class InspectionBooking(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"
        COMPLETED = "COMPLETED", "Completed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    listing = models.ForeignKey(
        PropertyListing, on_delete=models.CASCADE, related_name="inspections"
    )
    tenant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="inspection_bookings",
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )
    scheduled_date = models.DateTimeField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Inspection for {self.listing.title} by {self.tenant}"


class SearchOptimization(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    listing = models.OneToOneField(
        PropertyListing, on_delete=models.CASCADE, related_name="optimization"
    )
    is_featured = models.BooleanField(default=False)
    boost_score = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Optimization for









# backend/properties/models/listings.py
import uuid
from django.conf import settings
from django.contrib.gis.db import models
from django.utils.text import slugify
from django.utils.timezone import now
from django.core.validators import MinValueValidator
from decimal import Decimal


def generate_property_uid():
    return f"PROP-{uuid.uuid4().hex[:10].upper()}"


class PropertyListing(models.Model):
    class ModelType(models.TextChoices):
        RENT = "RENT", "Rent"
        LEASE = "LEASE", "Lease"
        SALE = "SALE", "Sale"
        SERVICE_APARTMENT = "SERVICE_APARTMENT", "Service Apartment"
        LAND = "LAND", "Land"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    property_uid = models.CharField(max_length=50, unique=True, editable=False, default=generate_property_uid)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="owned_listings")
    agent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="agent_listings")
    model_type = models.CharField(max_length=30, choices=ModelType.choices)
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, blank=True, editable=False)
    short_description = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    base_price = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0.00"), validators=[MinValueValidator(Decimal("0.00"))])
    currency = models.CharField(max_length=8, default="NGN")
    service_charge = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    # detailed specs
    bedrooms = models.PositiveIntegerField(default=0)
    bathrooms = models.PositiveIntegerField(default=0)
    toilets = models.PositiveIntegerField(default=0)
    # facilities as list of strings, e.g. ["water_heater", "wardrobe"]
    facilities = models.JSONField(default=list, blank=True)
    # location: use PointField for geo-search (make sure PostGIS is enabled)
    location = models.PointField(geography=True, null=True, blank=True)
    address = models.TextField(blank=True)
    is_published = models.BooleanField(default=False)
    ranking_score = models.FloatField(default=0)
    boost_until = models.DateTimeField(null=True, blank=True)
    is_boosted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    # optional expiration for unpaid posts (admin controlled default)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["property_uid"]),
            models.Index(fields=["model_type"]),
            models.Index(fields=["is_published"]),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)[:50]
        # auto-manage is_boosted flag depending on boost_until
        if self.boost_until and self.boost_until > now():
            self.is_boosted = True
        else:
            self.is_boosted = False
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} ({self.property_uid})"
