# backend/apartments/models.py
from django.db import models
from django.conf import settings
from django.utils import timezone
from properties.models import Property

def pad_seq(num: int, width: int = 4) -> str:
    return str(num).zfill(width)

def generate_apartment_uid(property_uid: str, seq_no: int) -> str:
    return f"{property_uid}/APTMT/{pad_seq(seq_no, 4)}"


class Apartment(models.Model):
    """
    Apartment under a property. UID is property UID + "/APTMT/{seq}".
    """
    uid = models.CharField(max_length=128, unique=True, editable=False)
    property = models.ForeignKey(Property, related_name="apartments", on_delete=models.CASCADE)
    number = models.CharField(max_length=64)
    floor = models.IntegerField(null=True, blank=True)
    bedrooms = models.IntegerField(default=1)
    rent_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    is_occupied = models.BooleanField(default=False)
    tenant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name="rented_apartments"
    )
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
