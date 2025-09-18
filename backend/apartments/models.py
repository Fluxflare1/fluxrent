# backend/apartments/models.py
from django.db import models
from properties.models import Property

class Apartment(models.Model):
    uid = models.CharField(max_length=128, unique=True, null=True, blank=True)
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="apartments", null=True, blank=True)
    number = models.CharField(max_length=64, blank=True)
    floor = models.IntegerField(null=True, blank=True)
    bedrooms = models.IntegerField(null=True, blank=True)
    rent_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.property or 'Property'} - {self.number or self.uid}"
