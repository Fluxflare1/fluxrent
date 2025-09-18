# backend/bills/models.py
from django.db import models
from apartments.models import Apartment

class Bill(models.Model):
    apartment = models.ForeignKey(Apartment, on_delete=models.SET_NULL, null=True, blank=True, related_name="bills")
    description = models.CharField(max_length=255, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    issued_at = models.DateTimeField(auto_now_add=True)
    due_at = models.DateTimeField(null=True, blank=True)
    paid = models.BooleanField(default=False)

    def __str__(self):
        return f"Bill {self.pk} - {self.amount}"
