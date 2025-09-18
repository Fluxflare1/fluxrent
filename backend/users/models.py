# backend/users/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from django.core.validators import RegexValidator

from .managers import UserManager
from .utils_uid import generate_user_uid

class Role(models.TextChoices):
    TENANT = "tenant", _("Tenant")
    AGENT = "agent", _("Agent")
    PROPERTY_MANAGER = "property_manager", _("Property Manager")
    SUPER_ADMIN = "super_admin", _("Super Admin")

# Custom user model
class User(AbstractUser):
    username = None  # we will use email as unique identifier
    email = models.EmailField(_("email address"), unique=True)

    # Role field
    role = models.CharField(
        max_length=32,
        choices=Role.choices,
        default=Role.TENANT,
        db_index=True,
    )

    # UID (generated when KYC completes)
    uid = models.CharField(max_length=64, blank=True, null=True, unique=True)

    # Dedicated Virtual Account (DVA) placeholder (paystack account reference)
    dva = models.CharField(max_length=128, blank=True, null=True)

    # Optional phone, metadata
    phone = models.CharField(max_length=32, blank=True, null=True)
    metadata = models.JSONField(default=dict, blank=True)

    # remove unused fields
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    class Meta:
        db_table = "auth_user_custom"
        verbose_name = _("user")
        verbose_name_plural = _("users")

    def __str__(self):
        return self.email

    def generate_uid(self, state_code: str = "01", lga_code: str = "01"):
        self.uid = generate_user_uid(state_code=state_code, lga_code=lga_code)
        return self.uid
