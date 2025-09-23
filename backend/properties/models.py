import uuid
from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL


def generate_uid(prefix: str) -> str:
    """Generate FluxRent UID like PROP-xxxx or APT-xxxx"""
    return f"{prefix}-{uuid.uuid4().hex[:10].upper()}"


class Property(models.Model):
    uid = models.CharField(
        max_length=20, unique=True, default=lambda: generate_uid("PROP")
    )
    manager = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="properties"
    )
    name = models.CharField(max_length=255)
    address = models.TextField()
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.uid})"


class Apartment(models.Model):
    uid = models.CharField(
        max_length=20, unique=True, default=lambda: generate_uid("APT")
    )
    property = models.ForeignKey(
        Property, on_delete=models.CASCADE, related_name="apartments"
    )
    name = models.CharField(max_length=255)  # e.g. "Flat A1", "Penthouse"
    floor = models.CharField(max_length=50, blank=True)
    bedrooms = models.PositiveIntegerField(default=1)
    bathrooms = models.PositiveIntegerField(default=1)
    rent_amount = models.DecimalField(max_digits=12, decimal_places=2)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["property", "name"]

    def __str__(self):
        return f"{self.name} ({self.uid}) in {self.property.name}"

    @property
    def rent_account(self):
        """Return linked rent account (to be implemented in billing/wallet)."""
        return f"RENT-{self.uid}"

    @property
    def bills_account(self):
        """Return linked bills account (to be implemented in billing)."""
        return f"BILLS-{self.uid}"
