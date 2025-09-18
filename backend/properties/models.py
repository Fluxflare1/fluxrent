# backend/properties/models.py
from django.db import models
from django.conf import settings
from django.utils import timezone

def pad_seq(num: int, width: int = 5) -> str:
    return str(num).zfill(width)

def generate_property_uid(state_code: str, lga_code: str, seq_no: int) -> str:
    """
    Format per SRS: PRP/[STATE_CODE]/[LGA_CODE]/[SEQ_NO]
    """
    if not state_code or not lga_code:
        raise ValueError("state_code and lga_code are required for property UID generation")
    return f"PRP/{state_code}/{lga_code}/{pad_seq(seq_no, 5)}"


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
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name="owned_properties"
    )
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)
    external_id = models.CharField(max_length=128, blank=True, null=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Property"
        verbose_name_plural = "Properties"

    def __str__(self):
        return f"{self.uid} — {self.name}"

    def save(self, *args, **kwargs):
        if not self.uid:
            base_qs = Property.objects.filter(state_code=self.state_code, lga_code=self.lga_code)
            last = base_qs.order_by("-id").first()
            next_seq = 1
            if last and last.uid:
                try:
                    last_seq_str = last.uid.split("/")[-1]
                    next_seq = int(last_seq_str) + 1
                except Exception:
                    next_seq = (base_qs.count() or 0) + 1
            self.uid = generate_property_uid(self.state_code, self.lga_code, next_seq)
        super().save(*args, **kwargs)
