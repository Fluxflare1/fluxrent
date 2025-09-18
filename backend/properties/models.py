# backend/properties/models.py
from django.db import models

class Property(models.Model):
    """
    Minimal Property model placeholder. Extend per SRS.
    """
    uid = models.CharField(max_length=128, unique=True, null=True, blank=True)
    name = models.CharField(max_length=200, blank=True)
    address = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name or self.uid or str(self.pk)
