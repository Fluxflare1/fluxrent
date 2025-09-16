from django.db import models, transaction
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password or "")
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", "admin")
        return self.create_user(email, password, **extra_fields)

ROLE_CHOICES = [
    ("admin", "Platform Admin"),
    ("property_admin", "Property Manager"),
    ("agent", "Agent"),
    ("tenant", "Tenant"),
]

STATUS_CHOICES = [
    ("pending", "Pending"),
    ("approved", "Approved"),
    ("rejected", "Rejected"),
]

class UIDSequence(models.Model):
    """
    Basic sequence table for UID generation per entity per (state,lga)
    """
    entity_type = models.CharField(max_length=32)  # 'tenant','agent','property'
    state_code = models.CharField(max_length=4, default="00")
    lga_code = models.CharField(max_length=4, default="00")
    seq = models.BigIntegerField(default=0)

    class Meta:
        unique_together = ("entity_type", "state_code", "lga_code")

class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True, db_index=True)
    username = models.CharField(max_length=150, blank=True)
    first_name = models.CharField(max_length=120, blank=True)
    last_name = models.CharField(max_length=120, blank=True)
    phone = models.CharField(max_length=30, blank=True)
    role = models.CharField(max_length=32, choices=ROLE_CHOICES, default="tenant")
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default="pending")
    uid = models.CharField(max_length=64, blank=True, null=True, unique=True)
    dva_id = models.CharField(max_length=128, blank=True, null=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(default=timezone.now)
    metadata = models.JSONField(default=dict, blank=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    def __str__(self):
        return f"{self.email} ({self.role})"
