from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
import shortuuid


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    username = None  # remove username
    uid = models.CharField(max_length=22, unique=True, default=shortuuid.uuid)
    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=20,
        choices=[
            ("ADMIN", "Admin"),
            ("MANAGER", "Property Manager"),
            ("AGENT", "Property Agent"),
            ("TENANT", "Tenant"),
        ],
        default="TENANT",
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ("ACTIVE", "Active"),
            ("PENDING", "Pending"),
            ("DISABLED", "Disabled"),
        ],
        default="PENDING",
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return f"{self.email} ({self.role})"
