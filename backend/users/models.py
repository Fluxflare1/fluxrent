import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.utils import timezone
from django.conf import settings
from .managers import UserManager


def generate_uid(prefix: str, seq: int, width: int = 6) -> str:
    return f"{prefix.upper()}/{str(seq).zfill(width)}"


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom user model with domain roles and KYC relation.
    UID is generated on save.
    """
    class Roles(models.TextChoices):
        PROPERTY_OWNER = "property_owner", "Property Owner"
        PROPERTY_MANAGER = "property_manager", "Property Manager"
        AGENT = "agent", "Agent"
        TENANT = "tenant", "Tenant"
        STAFF = "staff", "Staff"
        VIEWER = "viewer", "Viewer"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    uid = models.CharField(max_length=64, unique=True, blank=True, null=True, editable=False)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=80, blank=True)
    last_name = models.CharField(max_length=80, blank=True)
    middle_name = models.CharField(max_length=80, blank=True)
    phone_number = models.CharField(max_length=32, blank=True)
    role = models.CharField(max_length=32, choices=Roles.choices, default=Roles.VIEWER)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)  # Django admin UI; NOT used for domain role checks
    date_joined = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    class Meta:
        ordering = ["-date_joined"]

    def __str__(self):
        return f"{self.email}"

    def save(self, *args, **kwargs):
        if not self.uid:
            # simple uid: USR/000001-like
            last = self.__class__.objects.order_by("-date_joined").first()
            seq = 1
            if last and last.uid:
                try:
                    seq = int(last.uid.split("/")[-1]) + 1
                except Exception:
                    seq = self.__class__.objects.count() + 1
            self.uid = generate_uid("USR", seq, width=6)
        super().save(*args, **kwargs)


class KYC(models.Model):
    """
    KYC data for user. Created/updated by user or admin.
    """
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="kyc")
    full_name = models.CharField(max_length=255, blank=True)
    address = models.TextField(blank=True)
    bvn = models.CharField(max_length=32, blank=True, null=True)
    id_number = models.CharField(max_length=128, blank=True, null=True)
    id_type = models.CharField(max_length=64, blank=True, null=True)
    verified = models.BooleanField(default=False)
    verified_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "KYC"
        verbose_name_plural = "KYC"

    def __str__(self):
        return f"KYC({self.user.email})"
