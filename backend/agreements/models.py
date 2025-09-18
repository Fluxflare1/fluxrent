# backend/agreements/models.py
from django.db import models
from users.models import User
from apartments.models import Apartment

class Agreement(models.Model):
    tenant = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="agreements")
    apartment = models.ForeignKey(Apartment, on_delete=models.SET_NULL, null=True, related_name="agreements")
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    signed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Agreement {self.pk} ({self.tenant})"
