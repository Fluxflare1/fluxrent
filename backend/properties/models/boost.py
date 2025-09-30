# backend/properties/models/boost.py
import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.validators import MinValueValidator

User = settings.AUTH_USER_MODEL


def generate_uid(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:10].upper()}"


class PlatformSetting(models.Model):
    """
    Small table for platform-wide settings controlling free-post lifetime, default boost durations, prices etc.
    Single row expected; admin UI will edit.
    """
    key = models.CharField(max_length=128, unique=True)
    value = models.JSONField(default=dict)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.key}"


class BoostPackage(models.Model):
    """
    Predefined boost packages (admin created).
    """
    uid = models.CharField(max_length=30, unique=True, default=lambda: generate_uid("BPK"))
    name = models.CharField(max_length=120)
    duration_days = models.PositiveIntegerField(help_text="How many days the boost lasts", default=7)
    price = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    created_at = models.DateTimeField(auto_now_add=True)
    active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.duration_days}d) - {self.price}"


class BoostPurchase(models.Model):
    """
    Records a purchase of boost for a listing.
    Payment may be via wallet or external gateway.
    """
    STATUS = (
        ("pending", "Pending"),
        ("success", "Success"),
        ("failed", "Failed"),
        ("cancelled", "Cancelled"),
    )

    uid = models.CharField(max_length=30, unique=True, default=lambda: generate_uid("BPU"))
    listing = models.ForeignKey(
        "properties.PropertyListing", on_delete=models.CASCADE, related_name="boost_purchases"
    )
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="boost_purchases")
    package = models.ForeignKey(BoostPackage, on_delete=models.CASCADE, related_name="purchases")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    reference = models.CharField(max_length=255, blank=True, null=True, help_text="Gateway or wallet reference")
    status = models.CharField(max_length=20, choices=STATUS, default="pending")
    purchased_at = models.DateTimeField(auto_now_add=True)
    starts_at = models.DateTimeField(null=True, blank=True)
    ends_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-purchased_at"]

    def activate(self, at=None):
        at = at or timezone.now()
        self.starts_at = at
        self.ends_at = at + timezone.timedelta(days=self.package.duration_days)
        self.status = "success"
        self.save(update_fields=["starts_at", "ends_at", "status"])
        # update listing boost metadata
        self.listing.ranking_score = self.listing.ranking_score  # no-op placeholder
        self.listing.save(update_fields=["ranking_score"])
        return self

    def __str__(self):
        return f"Boost {self.uid} for {self.listing} ({self.status})"
