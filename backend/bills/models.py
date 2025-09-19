# backend/bills/models.py
from django.conf import settings
from django.db import models, transaction
from django.utils import timezone
from django.core.validators import MinValueValidator
from django.urls import reverse

# We import TenantApartment lazily to avoid circular imports in startup.
# Expected path: tenants.models.TenantApartment
# If yours is different, update the string path in ForeignKey below.

class BillType(models.Model):
    name = models.CharField(max_length=128, unique=True)
    description = models.TextField(blank=True)
    is_recurring = models.BooleanField(default=True)
    default_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)])

    class Meta:
        ordering = ["name"]
        verbose_name = "Bill Type"
        verbose_name_plural = "Bill Types"

    def __str__(self):
        return self.name


class Bill(models.Model):
    """
    A bill definition attached to an Apartment (e.g., monthly rent, electricity)
    """
    apartment = models.ForeignKey("properties.Apartment", on_delete=models.CASCADE, related_name="bills")
    bill_type = models.ForeignKey(BillType, on_delete=models.PROTECT, related_name="bills")
    amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    start_date = models.DateField(default=timezone.now)
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-start_date"]
        indexes = [
            models.Index(fields=["apartment", "is_active"]),
        ]
        verbose_name = "Bill"
        verbose_name_plural = "Bills"

    def __str__(self):
        return f"{self.bill_type.name} — {self.apartment.uid} — {self.amount}"


def generate_invoice_number():
    """
    Invoice number format: INV/{YEAR}/{SEQ}
    We make a simple DB-backed increment using a dedicated table to avoid race conditions.
    """
    from django.db import connection
    year = timezone.now().year
    table = "bills_invoiceseq"
    # ensure table exists (migrate will create model, but safe guard)
    with connection.cursor() as cursor:
        try:
            cursor.execute(f"SELECT nextval(pg_get_serial_sequence('{table}','id'))")
        except Exception:
            # Fallback: use timestamp seq
            return f"INV/{year}/{int(timezone.now().timestamp())}"
        # If nextval returned, roll back (we rely on InvoiceSeq model instead)
    from .models import InvoiceSeq  # noqa: E402 (we import locally)
    seq = InvoiceSeq.objects.create()
    return f"INV/{year}/{str(seq.id).zfill(6)}"


class InvoiceSeq(models.Model):
    """
    simple incrementer used to allocate invoice numbers safely (auto PK)
    """
    created_at = models.DateTimeField(auto_now_add=True)


class Invoice(models.Model):
    STATUS_DRAFT = "draft"
    STATUS_ISSUED = "issued"
    STATUS_PAID = "paid"
    STATUS_OVERDUE = "overdue"
    STATUS_CANCELLED = "cancelled"
    STATUS_CHOICES = [
        (STATUS_DRAFT, "Draft"),
        (STATUS_ISSUED, "Issued"),
        (STATUS_PAID, "Paid"),
        (STATUS_OVERDUE, "Overdue"),
        (STATUS_CANCELLED, "Cancelled"),
    ]

    tenant_apartment = models.ForeignKey("tenants.TenantApartment", on_delete=models.CASCADE, related_name="invoices")
    invoice_no = models.CharField(max_length=64, unique=True, editable=False)
    issue_date = models.DateField(default=timezone.now)
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default=STATUS_DRAFT)
    total_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    paid_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    metadata = models.JSONField(default=dict, blank=True)  # free-form

    class Meta:
        ordering = ["-issue_date", "-created_at"]
        indexes = [models.Index(fields=["invoice_no"]), models.Index(fields=["tenant_apartment"])]
        verbose_name = "Invoice"
        verbose_name_plural = "Invoices"

    def __str__(self):
        return f"{self.invoice_no} — {self.tenant_apartment}"

    def recalc_totals(self):
        totals = self.lines.aggregate(total=models.Sum("amount")) or {}
        total = totals.get("total") or 0
        paid = self.payments.filter(status="confirmed").aggregate(total=models.Sum("amount")) or {}
        paid_total = paid.get("total") or 0
        self.total_amount = total
        self.paid_amount = paid_total
        # update status if fully paid
        if self.total_amount and self.paid_amount >= self.total_amount:
            self.status = self.STATUS_PAID
        self.save(update_fields=["total_amount", "paid_amount", "status", "updated_at"])


class InvoiceLine(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="lines")
    bill = models.ForeignKey(Bill, on_delete=models.SET_NULL, null=True, blank=True, related_name="invoice_lines")
    description = models.CharField(max_length=512, blank=True)
    amount = models.DecimalField(max_digits=14, decimal_places=2, validators=[MinValueValidator(0)])
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["invoice", "id"]
        verbose_name = "Invoice Line"
        verbose_name_plural = "Invoice Lines"

    def __str__(self):
        return f"{self.invoice.invoice_no}: {self.description or self.bill and self.bill.bill_type.name} - {self.amount}"


class Payment(models.Model):
    METHOD_CHOICES = [
        ("bank", "Bank Transfer"),
        ("card", "Card"),
        ("cash", "Cash"),
        ("wallet", "Wallet"),
        ("paystack", "Paystack"),
        ("other", "Other"),
    ]
    STATUS_PENDING = "pending"
    STATUS_CONFIRMED = "confirmed"
    STATUS_FAILED = "failed"
    STATUS_REFUNDED = "refunded"
    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_CONFIRMED, "Confirmed"),
        (STATUS_FAILED, "Failed"),
        (STATUS_REFUNDED, "Refunded"),
    ]

    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="payments")
    payment_ref = models.CharField(max_length=128, unique=True)
    amount = models.DecimalField(max_digits=14, decimal_places=2, validators=[MinValueValidator(0)])
    method = models.CharField(max_length=32, choices=METHOD_CHOICES, default="bank")
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default=STATUS_PENDING)
    paid_at = models.DateTimeField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-paid_at", "-created_at"]
        indexes = [models.Index(fields=["payment_ref"]), models.Index(fields=["invoice"])]

    def __str__(self):
        return f"{self.payment_ref} - {self.amount} ({self.status})"

    def confirm(self, paid_at=None):
        self.status = self.STATUS_CONFIRMED
        self.paid_at = paid_at or timezone.now()
        self.save(update_fields=["status", "paid_at"])
        # update invoice totals
        self.invoice.recalc_totals()
