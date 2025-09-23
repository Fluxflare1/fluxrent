from django.db import models, transaction
from django.conf import settings
from django.utils import timezone
import uuid


class TenantApartment(models.Model):
    """
    Canonical bond between a tenant (user) and an apartment.
    Used across bills/payments/agreements as the authoritative tenant-apartment link.
    """
    class BondStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        ACTIVE = "active", "Active"
        TERMINATED = "terminated", "Terminated"
        REJECTED = "rejected", "Rejected"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="tenant_apartments",
    )
    # string FK to avoid circular import
    apartment = models.ForeignKey(
        "apartments.Apartment",
        on_delete=models.CASCADE,
        related_name="tenant_bonds",
    )
    bond_status = models.CharField(max_length=16, choices=BondStatus.choices, default=BondStatus.PENDING)
    initiated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="initiated_tenant_bonds",
        help_text="Who initiated the bond (tenant or PM)"
    )
    requested_at = models.DateTimeField(default=timezone.now)
    activated_at = models.DateTimeField(null=True, blank=True)
    terminated_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, default="")

    class Meta:
        unique_together = ("tenant", "apartment")
        ordering = ["-requested_at"]
        verbose_name = "Tenant — Apartment Bond"
        verbose_name_plural = "Tenant — Apartment Bonds"
        indexes = [
            models.Index(fields=["tenant"]),
            models.Index(fields=["apartment"]),
            models.Index(fields=["bond_status"]),
        ]

    def __str__(self):
        return f"{self.tenant} → {self.apartment} ({self.bond_status})"

    def activate(self, actor=None):
        """Mark bond active."""
        if self.bond_status == self.BondStatus.ACTIVE:
            return
        self.bond_status = self.BondStatus.ACTIVE
        self.activated_at = timezone.now()
        if actor:
            self.initiated_by = actor
        self.save(update_fields=["bond_status", "activated_at", "initiated_by"])

    def terminate(self, actor=None, notes: str = ""):
        """
        Terminate bond, set terminated_at and bond_status.
        Also return a StatementOfStay instance generated snapshot (balance summary).
        """
        if self.bond_status == self.BondStatus.TERMINATED:
            # Already terminated
            return None
        self.bond_status = self.BondStatus.TERMINATED
        self.terminated_at = timezone.now()
        if notes:
            self.notes = (self.notes or "") + f"\nTerminated notes: {notes}"
        self.save(update_fields=["bond_status", "terminated_at", "notes"])
        # Generate statement (best-effort; bills/payments app may provide calculation)
        statement = StatementOfStay.generate_for(self)
        return statement


class BondRequest(models.Model):
    """
    A lightweight request object representing tenant-initiated or PM-initiated bond flows.
    Approval creates/activates a TenantApartment.
    """
    class RequestStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
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
        help_text="User who initiated the request (tenant or PM).",
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
        verbose_name = "Bond Request"
        verbose_name_plural = "Bond Requests"

    def __str__(self):
        return f"BondRequest {self.tenant} → {self.apartment} ({self.status})"

    def approve(self, actor=None):
        """
        Approve request: create or activate TenantApartment and set status.
        Returns the TenantApartment instance created/activated.
        """
        if self.status == self.RequestStatus.APPROVED:
            # find existing tenant-apartment if any
            try:
                ta = TenantApartment.objects.get(tenant=self.tenant, apartment=self.apartment)
                if ta.bond_status != TenantApartment.BondStatus.ACTIVE:
                    ta.activate(actor=actor or self.processed_by)
                return ta
            except TenantApartment.DoesNotExist:
                pass

        with transaction.atomic():
            ta, created = TenantApartment.objects.get_or_create(
                tenant=self.tenant,
                apartment=self.apartment,
                defaults={
                    "initiated_by": self.initiator or actor,
                    "bond_status": TenantApartment.BondStatus.ACTIVE,
                    "activated_at": timezone.now(),
                },
            )
            if not created:
                # ensure active
                if ta.bond_status != TenantApartment.BondStatus.ACTIVE:
                    ta.activate(actor=actor or self.processed_by)
            self.status = self.RequestStatus.APPROVED
            self.processed_by = actor
            self.processed_at = timezone.now()
            self.save(update_fields=["status", "processed_by", "processed_at"])
            return ta

    def reject(self, actor=None):
        if self.status == self.RequestStatus.REJECTED:
            return
        self.status = self.RequestStatus.REJECTED
        self.processed_by = actor
        self.processed_at = timezone.now()
        self.save(update_fields=["status", "processed_by", "processed_at"])


class StatementOfStay(models.Model):
    """
    Final statement generated when a TenantApartment is terminated/unbonded.
    Holds a snapshot of outstanding/paid balances related to that tenancy.
    NOTE: Amount calculations are best-effort: integrate with bills/payments app if available.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant_apartment = models.ForeignKey(TenantApartment, on_delete=models.CASCADE, related_name="statements")
    generated_at = models.DateTimeField(default=timezone.now)
    total_billed = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-generated_at"]

    def __str__(self):
        return f"StatementOfStay {self.id} ({self.tenant_apartment})"

    @staticmethod
    def generate_for(tenant_apartment: TenantApartment):
        """
        Create a StatementOfStay snapshot for the tenant_apartment.
        Integrate with bills/payments app if available to compute totals.
        """
        # Try to compute using bills/payments if available.
        total_billed = 0
        total_paid = 0
        notes = ""
        try:
            # If bills app exists and Invoice model present, compute invoice sums
            from bills.models import Invoice, PaymentRecord  # noqa: F401
            # Sum invoices for the apartment
            invoices = Invoice.objects.filter(apartment=tenant_apartment.apartment)
            total_billed = sum([inv.amount for inv in invoices]) if invoices.exists() else 0
            # Sum payments linked to tenant on these invoices
            payments = PaymentRecord.objects.filter(invoice__in=invoices, tenant=tenant_apartment.tenant)
            total_paid = sum([p.amount for p in payments]) if payments.exists() else 0
        except Exception:
            # If bills/payments aren't available yet, leave totals at zero.
            notes = "Statement generated without bills/payments integration."

        balance = total_billed - total_paid
        statement = StatementOfStay.objects.create(
            tenant_apartment=tenant_apartment,
            total_billed=total_billed,
            total_paid=total_paid,
            balance=balance,
            notes=notes,
        )
        return statement
