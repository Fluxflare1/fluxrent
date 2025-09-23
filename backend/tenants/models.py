import uuid
from django.db import models
from django.conf import settings
from properties.models import Apartment, Property
from django.db.models.signals import post_save
from django.dispatch import receiver
from bills.models import Invoice, PaymentRecord
import decimal

User = settings.AUTH_USER_MODEL


def generate_uid(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:10].upper()}"


class TenantBond(models.Model):
    """
    Represents the bonding of a tenant to a property manager
    (parent relationship — before linking to a specific apartment).
    """
    uid = models.CharField(max_length=20, unique=True, default=lambda: generate_uid("BOND"))
    tenant = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tenant_bonds")
    property_manager = models.ForeignKey(User, on_delete=models.CASCADE, related_name="managed_tenants")
    status = models.CharField(
        max_length=20,
        choices=[("pending", "Pending"), ("approved", "Approved"), ("rejected", "Rejected")],
        default="pending",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Bond {self.uid}: {self.tenant} -> {self.property_manager} ({self.status})"


class TenantApartment(models.Model):
    """
    Once a TenantBond is approved, tenant gets linked to an Apartment.
    Bills and Rent are attached at the Apartment level.
    """
    uid = models.CharField(max_length=20, unique=True, default=lambda: generate_uid("TENAPT"))
    tenant_bond = models.ForeignKey(TenantBond, on_delete=models.CASCADE, related_name="apartments")
    apartment = models.ForeignKey(Apartment, on_delete=models.CASCADE, related_name="tenants")
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)  # on exit/unbond
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.tenant_bond.tenant} in {self.apartment} (active={self.is_active})"


class StatementOfStay(models.Model):
    """
    Generated when tenant exits. Record of stay + bills/payments summary.
    """
    uid = models.CharField(max_length=20, unique=True, default=lambda: generate_uid("STAY"))
    tenant_apartment = models.OneToOneField(TenantApartment, on_delete=models.CASCADE, related_name="statement")
    summary = models.TextField()  # later link to invoice/bills
    issued_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Statement {self.uid} for {self.tenant_apartment}"




class StatementOfStay(models.Model):
    # ... (existing fields)

    @classmethod
    def generate_for(cls, tenant_apartment):
        invoices = tenant_apartment.invoices.all()
        total_due = decimal.Decimal("0.00")
        total_paid = decimal.Decimal("0.00")
        breakdown = []

        for inv in invoices:
            total_due += inv.total_amount
            payments = sum(p.amount_paid for p in inv.payments.all())
            total_paid += payments
            breakdown.append(
                f"{inv.uid} ({inv.type}): Due {inv.total_amount}, Paid {payments}"
            )

        summary = (
            f"Tenant: {tenant_apartment.tenant_bond.tenant}\n"
            f"Apartment: {tenant_apartment.apartment}\n"
            f"Stay: {tenant_apartment.start_date} → {tenant_apartment.end_date}\n\n"
            f"Invoices:\n" + "\n".join(breakdown) + "\n\n"
            f"TOTAL DUE: {total_due}\nTOTAL PAID: {total_paid}\nBALANCE: {total_due - total_paid}"
        )

        return cls.objects.create(tenant_apartment=tenant_apartment, summary=summary)


@receiver(post_save, sender=TenantApartment)
def generate_statement_on_exit(sender, instance, **kwargs):
    if not instance.is_active and instance.end_date and not hasattr(instance, "statement"):
        StatementOfStay.generate_for(instance)
