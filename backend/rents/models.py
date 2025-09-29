# backend/rents/models.py
import uuid
from decimal import Decimal
from django.db import models, transaction
from django.conf import settings
from django.utils import timezone
from django.core.validators import MinValueValidator

def generate_uid(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:10].upper()}"

User = settings.AUTH_USER_MODEL

class Tenancy(models.Model):
    """
    Represents a tenancy binding a tenant to an apartment for a period.
    """
    uid = models.CharField(max_length=32, unique=True, default=lambda: generate_uid("TEN"))
    tenant = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tenancies")
    apartment = models.ForeignKey("properties.Apartment", on_delete=models.CASCADE, related_name="tenancies")
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    monthly_rent = models.DecimalField(max_digits=12, decimal_places=2)
    billing_cycle = models.CharField(max_length=20, default="monthly")  # monthly/weekly/daily
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["uid"]),
            models.Index(fields=["tenant"]),
            models.Index(fields=["apartment"]),
        ]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.uid} - {self.apartment} - {self.tenant}"

class LateFeeRule(models.Model):
    """
    Per-property late fee rule. Property manager can enable/disable.
    """
    property = models.OneToOneField("properties.Property", on_delete=models.CASCADE, related_name="late_fee_rule")
    enabled = models.BooleanField(default=False)
    # either percentage (e.g. 5) OR fixed_amount (e.g. 5000). Both can be present; percentage applied first then fixed.
    percentage = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(Decimal("0"))], default=Decimal("0.00"))
    fixed_amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal("0"))], default=Decimal("0.00"))
    grace_days = models.PositiveIntegerField(default=0)  # days before fees apply

    def __str__(self):
        return f"LateFeeRule for {self.property.uid}"

class RentInvoice(models.Model):
    """
    Rent invoice for a tenancy. Integrates with bills.Invoice concept but separate for rent-specific workflows.
    """
    STATUS_CHOICES = [("pending", "pending"), ("partially_paid", "partially_paid"), ("paid", "paid"), ("overdue", "overdue"), ("cancelled", "cancelled")]
    uid = models.CharField(max_length=32, unique=True, default=lambda: generate_uid("RINV"))
    tenancy = models.ForeignKey(Tenancy, on_delete=models.CASCADE, related_name="invoices")
    issue_date = models.DateField(auto_now_add=True)
    due_date = models.DateField()
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    outstanding = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0.00"))
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    # optional reference to bills.Invoice if you want to link
    bills_invoice = models.ForeignKey("bills.Invoice", null=True, blank=True, on_delete=models.SET_NULL, related_name="rent_invoices")

    class Meta:
        ordering = ["-due_date"]
        indexes = [
            models.Index(fields=["uid"]),
            models.Index(fields=["tenancy"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self):
        return f"{self.uid} - {self.tenancy.uid} - {self.amount}"

    def save(self, *args, **kwargs):
        # ensure outstanding on creation
        if not self.pk:
            self.outstanding = self.amount
        super().save(*args, **kwargs)

    def apply_payment(self, amount: Decimal):
        """
        Reduce outstanding by amount, update status.
        Returns tuple (applied_amount, remaining_outstanding)
        """
        with transaction.atomic():
            self.refresh_from_db()
            to_apply = min(self.outstanding, amount)
            self.outstanding = (self.outstanding - to_apply).quantize(Decimal("0.01"))
            if self.outstanding <= 0:
                self.outstanding = Decimal("0.00")
                self.status = "paid"
            else:
                self.status = "partially_paid"
            self.save(update_fields=["outstanding", "status", "updated_at"])
            return to_apply, self.outstanding

    def mark_overdue_if_needed(self):
        if self.status not in ("paid", "cancelled") and self.due_date < timezone.now().date():
            self.status = "overdue"
            self.save(update_fields=["status", "updated_at"])

class RentPayment(models.Model):
    """
    Payment against a rent invoice. Canonical record. Payment may be from wallet or external.
    """
    PAYMENT_METHODS = [
        ("wallet", "Wallet"),
        ("card", "Card"),
        ("bank", "Bank Transfer"),
        ("cash", "Cash"),
        ("external", "External"),
    ]
    uid = models.CharField(max_length=32, unique=True, default=lambda: generate_uid("RPAY"))
    invoice = models.ForeignKey(RentInvoice, on_delete=models.CASCADE, related_name="payments")
    payer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="rent_payments")
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    reference = models.CharField(max_length=255, blank=True, null=True)
    confirmed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="confirmed_rent_payments")
    status = models.CharField(max_length=20, choices=[("pending", "pending"), ("success", "success"), ("failed", "failed")], default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["uid"]),
            models.Index(fields=["invoice"]),
            models.Index(fields=["payer"]),
        ]

    def __str__(self):
        return f"{self.uid} - {self.invoice.uid} - {self.amount}"

    def finalize_success(self):
        """
        Mark as success and apply to invoice outstanding; create audit links.
        """
        if self.status == "success":
            return
        with transaction.atomic():
            self.status = "success"
            self.confirmed_at = timezone.now()
            self.save(update_fields=["status", "confirmed_at"])
            applied, remaining = self.invoice.apply_payment(self.amount)
            # Could create link to Payments app PaymentRecord if needed
            return applied, remaining

class Receipt(models.Model):
    """
    Simple receipt generated after a RentPayment finalization.
    """
    uid = models.CharField(max_length=32, unique=True, default=lambda: generate_uid("RCT"))
    payment = models.OneToOneField(RentPayment, on_delete=models.CASCADE, related_name="receipt")
    issued_at = models.DateTimeField(auto_now_add=True)
    meta = models.JSONField(blank=True, null=True)

    def __str__(self):
        return f"Receipt {self.uid} - {self.payment.uid}"
