# backend/tenants/models.py
from django.db import models
from django.conf import settings
from django.utils import timezone

# import Apartment lazily to avoid circular imports if necessary
# Apartment is defined in apartments app; we reference via string FK below.

class TenantApartment(models.Model):
    """
    Represents an active (or historical) bond between a tenant (User) and an Apartment.
    This is the canonical association used across bills/payments/agreements.
    """
    class BondStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        ACTIVE = "active", "Active"
        TERMINATED = "terminated", "Terminated"
        REJECTED = "rejected", "Rejected"

    tenant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="tenant_apartments",
    )
    apartment = models.ForeignKey(
        "apartments.Apartment",
        on_delete=models.CASCADE,
        related_name="tenant_bonds",
    )
    bond_status = models.CharField(
        max_length=16,
        choices=BondStatus.choices,
        default=BondStatus.PENDING,
    )
    # Who initiated the bond (user id). Could be a PM or tenant.
    initiated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="initiated_tenant_bonds",
    )
    requested_at = models.DateTimeField(default=timezone.now)
    activated_at = models.DateTimeField(null=True, blank=True)
    terminated_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, default="")

    class Meta:
        unique_together = ("tenant", "apartment")
        ordering = ["-requested_at"]
        indexes = [
            models.Index(fields=["tenant"]),
            models.Index(fields=["apartment"]),
            models.Index(fields=["bond_status"]),
        ]

    def __str__(self):
        return f"{self.tenant} -> {self.apartment} ({self.bond_status})"


class BondRequest(models.Model):
    """
    A lightweight request object representing tenant-initiated or PM-initiated bond flows.
    When approved, a TenantApartment will be created/activated.
    """
    class RequestStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    tenant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="bond_requests",
    )
    apartment = models.ForeignKey(
        "apartments.Apartment",
        on_delete=models.CASCADE,
        related_name="bond_requests",
    )
    initiator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="initiated_bond_requests",
        help_text="User who initiated the request (could be the tenant or a PM).",
    )
    message = models.TextField(blank=True)
    status = models.CharField(max_length=16, choices=RequestStatus.choices, default=RequestStatus.PENDING)
    created_at = models.DateTimeField(default=timezone.now)
    processed_at = models.DateTimeField(null=True, blank=True)
    processed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="processed_bond_requests",
    )

    class Meta:
        ordering = ["-created_at"]
        unique_together = ("tenant", "apartment")

    def __str__(self):
        return f"Request {self.tenant} -> {self.apartment} ({self.status})"
