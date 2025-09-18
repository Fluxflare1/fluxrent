# backend/properties/models.py
import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.exceptions import ValidationError

def pad_seq(num: int, width: int = 5) -> str:
    return str(num).zfill(width)

def generate_property_uid(state_code: str, lga_code: str, seq_no: int) -> str:
    """
    Format per SRS: TNT/[STATE_CODE]/[LGA_CODE]/[SEQ_NO]
    For properties we'll use: PRP/[STATE_CODE]/[LGA_CODE]/[SEQ_NO]
    """
    if not state_code or not lga_code:
        raise ValueError("state_code and lga_code are required for property UID generation")
    return f"PRP/{state_code}/{lga_code}/{pad_seq(seq_no, 5)}"

def generate_apartment_uid(property_uid: str, seq_no: int) -> str:
    return f"{property_uid}/APTMT/{pad_seq(seq_no, 4)}"


class Property(models.Model):
    """
    Represent a Property (building / house / lot) — has a unique property UID.
    """
    uid = models.CharField(max_length=64, unique=True, editable=False)
    name = models.CharField(max_length=255)
    address = models.TextField(blank=True)
    state_code = models.CharField(max_length=10)
    lga_code = models.CharField(max_length=10)
    street = models.CharField(max_length=255, blank=True)
    house_no = models.CharField(max_length=100, blank=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="owned_properties")
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    # a human-friendly optional external reference
    external_id = models.CharField(max_length=128, blank=True, null=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Property"
        verbose_name_plural = "Properties"

    def __str__(self):
        return f"{self.uid} — {self.name}"

    def save(self, *args, **kwargs):
        # If uid is not set, auto-generate using a simple counter per state+lga combination.
        if not self.uid:
            # Find next seq for this state+lga
            base_qs = Property.objects.filter(state_code=self.state_code, lga_code=self.lga_code)
            last = base_qs.order_by("-id").first()
            next_seq = 1
            if last and last.uid:
                # attempt to parse last uid seq
                try:
                    last_seq_str = last.uid.split("/")[-1]
                    next_seq = int(last_seq_str) + 1
                except Exception:
                    next_seq = (base_qs.count() or 0) + 1
            self.uid = generate_property_uid(self.state_code, self.lga_code, next_seq)
        super().save(*args, **kwargs)


class Apartment(models.Model):
    """
    Apartment under a property. UID is property UID + "/APTMT/{seq}".
    """
    uid = models.CharField(max_length=128, unique=True, editable=False)
    property = models.ForeignKey(Property, related_name="apartments", on_delete=models.CASCADE)
    number = models.CharField(max_length=64)  # e.g., "A1", "101"
    floor = models.IntegerField(null=True, blank=True)
    bedrooms = models.IntegerField(default=1)
    rent_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    is_occupied = models.BooleanField(default=False)
    tenant = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="rented_apartments")
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("property", "number")
        ordering = ["property", "number"]
        verbose_name = "Apartment"
        verbose_name_plural = "Apartments"

    def __str__(self):
        return f"{self.uid} ({self.property.uid})"

    def save(self, *args, **kwargs):
        if not self.uid:
            # next sequence within the property
            base_qs = Apartment.objects.filter(property=self.property)
            last = base_qs.order_by("-id").first()
            next_seq = 1
            if last and last.uid and last.uid.startswith(self.property.uid):
                try:
                    last_seq_str = last.uid.split("/")[-1]
                    next_seq = int(last_seq_str) + 1
                except Exception:
                    next_seq = (base_qs.count() or 0) + 1
            self.uid = generate_apartment_uid(self.property.uid, next_seq)
        super().save(*args, **kwargs)
