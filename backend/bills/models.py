import uuid
from django.db import models
from tenants.models import TenantApartment


def generate_uid(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:10].upper()}"


class Invoice(models.Model):
    """
    Parent invoice, can be Rent or Utility or Other type.
    """
    uid = models.CharField(max_length=20, unique=True, default=lambda: generate_uid("INV"))
    tenant_apartment = models.ForeignKey(TenantApartment, on_delete=models.CASCADE, related_name="invoices")
    type = models.CharField(
        max_length=20,
        choices=[("rent", "Rent"), ("utility", "Utility"), ("other", "Other")],
    )
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    issued_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateField()
    is_paid = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.uid} ({self.type}) - {self.total_amount}"


class BillItem(models.Model):
    """
    Line items under each invoice.
    """
    uid = models.CharField(max_length=20, unique=True, default=lambda: generate_uid("ITEM"))
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="items")
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.description} - {self.amount}"


class PaymentRecord(models.Model):
    """
    Payment against invoices.
    """
    uid = models.CharField(max_length=20, unique=True, default=lambda: generate_uid("PAY"))
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="payments")
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2)
    paid_at = models.DateTimeField(auto_now_add=True)
    method = models.CharField(
        max_length=20,
        choices=[("bank", "Bank Transfer"), ("card", "Card"), ("cash", "Cash")],
    )

    def __str__(self):
        return f"Payment {self.uid} - {self.amount_paid}"




class Invoice(models.Model):
    uid = models.CharField(max_length=20, unique=True, default=lambda: generate_uid("INV"))
    tenant_apartment = models.ForeignKey("tenants.TenantApartment", on_delete=models.CASCADE, related_name="invoices")
    category = models.CharField(max_length=50, default="rent")  # e.g., rent, utilities
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=[("pending", "Pending"), ("paid", "Paid")], default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
