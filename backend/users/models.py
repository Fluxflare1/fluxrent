# backend/users/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from core.uid import gen_user_uid

class User(AbstractUser):
    """
    Custom user model. We subclass AbstractUser to keep Django admin compatibility.
    Add 'uid', 'role', 'phone', 'dva' (placeholder).
    """
    class Role(models.TextChoices):
        TENANT = "tenant", "Tenant"
        AGENT = "agent", "Agent"
        MANAGER = "manager", "Property Manager"
        SUPER_ADMIN = "super_admin", "Super Admin"
        ADMIN = "admin", "Admin"

    uid = models.CharField(max_length=64, unique=True, blank=True, null=True)
    role = models.CharField(max_length=32, choices=Role.choices, default=Role.TENANT)
    phone = models.CharField(max_length=32, blank=True, null=True)
    dva = models.CharField(max_length=128, blank=True, null=True)  # dedicated virtual account id

    def save(self, *args, **kwargs):
        if not self.uid:
            # Simple generation; in production, sequence should be deterministic & atomic.
            self.uid = gen_user_uid(prefix="TNT", state_code="00", lga_code="00")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.email or self.username} ({self.role})"
