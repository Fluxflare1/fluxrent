# backend/bills/models.py
from django.conf import settings
from django.db import models, transaction
from django.utils import timezone
from django.core.validators import MinValueValidator
import uuid

# NOTE:
# - apartment FK points to apartments.Apartment. If your project uses properties.Apartment instead,
#   replace "apartments.Apartment" with "properties.Apartment".
# - tenant_apartment FK points to tenants.TenantApartment. Change if your tenants app/model differs.


class BillType(models.Model):
    name = models.CharField(max_length=128, unique=True)
    description = models.TextField(blank=True)
    is_recurring = models.BooleanField(default=True)
    default_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
    )

    class Meta:
        ordering = ["name"]
        verbose_name = "Bill Type"
        verbose_name_plural = "Bill Types"

    def __str__(self) -> str:
        return self.name


class Bill(models.Model):
    """
    A bill definition attached to an Apartment (e.g., monthly rent, electricity).
    Bills are tied to an Apartment, not directly to a tenant.
    """
    apartment = models.ForeignKey(
        "apartments.Apartment",
        on_delete=models.CASCADE,
        related_name="bills",
        help_text="Apartment this bill belongs to (e.g., monthly rent).",
    )
    bill_type = models.ForeignKey(
        BillType,
        on_delete=models.PROTECT,
        related_name="bills",
    )
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

    def __str__(self) -> str:
        return f"{self.bill_type.name} — {getattr(self.apartment, 'uid', self.apartment)} — {self.amount}"


class InvoiceSeq(models.Model):
    """
    Simple DB-backed sequence table used to allocate invoice numbers safely.
    We create a new row for each invoice number and use the auto-increment id as the sequence.
    """
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Invoice Sequence"
        verbose_name_plural = "Invoice Sequences"


def _generate_invoice_number():
    """
    Invoice number format: INV/{YEAR}/{SEQ:06d}
    Uses InvoiceSeq inside a transaction to ensure unique, monotonically increasing sequence per invoice.
    """
    year = timezone.now().year
    with transaction.atomic():
        seq = InvoiceSeq.objects.create()
        seq_id = seq.id
    return f"INV/{year}/{str(seq_id).zfill(6)}"


class Invoice(models.Model):
    """
    Invoice created for a TenantApartment (bond between tenant and apartment).
    Invoice contains lines and payments; totals are recalculated via recalc_totals().
    """
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

    PAYMENT_METHOD_CHOICES = [
        ("WALLET", "Wallet"),
        ("BANK_TRANSFER", "Bank Transfer"),
        ("CASH", "Cash"),
        ("OTHER", "Other"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant_apartment = models.ForeignKey(
        "tenants.TenantApartment",
        on_delete=models.CASCADE,
        related_name="invoices",
        help_text="The tenant-apartment bond this invoice is for.",
    )
    invoice_no = models.CharField(max_length=64, unique=True, editable=False, default=_generate_invoice_number)
    issue_date = models.DateField(default=timezone.now)
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default=STATUS_DRAFT)
    total_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    paid_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    metadata = models.JSONField(default=dict, blank=True)

    # Manual confirmation fields
    paid_via = models.CharField(
        max_length=50,
        choices=PAYMENT_METHOD_CHOICES,
        blank=True,
        null=True,
        help_text="Payment method used for this invoice (set on manual confirm).",
    )
    confirmed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="confirmed_invoices",
        help_text="User (e.g., property manager) who confirmed manual payment.",
    )
    confirmed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ["-issue_date", "-created_at"]
        indexes = [
            models.Index(fields=["invoice_no"]),
            models.Index(fields=["tenant_apartment"]),
            models.Index(fields=["status"]),
        ]
        verbose_name = "Invoice"
        verbose_name_plural = "Invoices"

    def __str__(self) -> str:
        return f"{self.invoice_no} — {self.tenant_apartment}"

    def recalc_totals(self):
        """
        Recalculate total and paid amounts from invoice lines and payments.
        Updates invoice status to PAID when paid_amount >= total_amount.
        """
        # Sum lines
        total = self.lines.aggregate(total=models.Sum("amount")).get("total") or 0
        # Sum confirmed payments
        paid_total = self.payments.filter(status=Payment.STATUS_CONFIRMED).aggregate(total=models.Sum("amount")).get("total") or 0

        # Update fields
        self.total_amount = total
        self.paid_amount = paid_total

        if self.total_amount and self.paid_amount >= self.total_amount:
            self.status = self.STATUS_PAID

        # Save only changed fields
        self.save(update_fields=["total_amount", "paid_amount", "status", "updated_at"])

    def confirm_manual_payment(self, user, payment_method: str, confirmed_at=None):
        """
        Confirm a manual payment (bank transfer / cash) for this invoice.
        - Marks invoice PAID, sets paid_amount
        - Records who confirmed it (confirmed_by)
        - Creates a Payment record with STATUS_CONFIRMED for audit
        Returns True if confirmation was applied, False if invoice already PAID.
        """
        if self.status == self.STATUS_PAID:
            return False

        confirmed_at = confirmed_at or timezone.now()

        # mark invoice as paid
        self.status = self.STATUS_PAID
        self.paid_amount = self.total_amount
        self.paid_via = payment_method
        self.confirmed_by = user
        self.confirmed_at = confirmed_at
        self.save(update_fields=["status", "paid_amount", "paid_via", "confirmed_by", "confirmed_at", "updated_at"])

        # create Payment audit record
        Payment.objects.create(
            invoice=self,
            payment_ref=f"MANUAL-{self.invoice_no}-{int(confirmed_at.timestamp())}",
            amount=self.total_amount,
            method=payment_method.lower() if isinstance(payment_method, str) else "other",
            status=Payment.STATUS_CONFIRMED,
            paid_at=confirmed_at,
            metadata={"manual_confirmation": True, "confirmed_by_id": getattr(user, "id", None)},
        )

        return True


class InvoiceLine(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="lines")
    bill = models.ForeignKey(
        Bill,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="invoice_lines",
        help_text="Optional source Bill that inspired this invoice line.",
    )
    description = models.CharField(max_length=512, blank=True)
    amount = models.DecimalField(max_digits=14, decimal_places=2, validators=[MinValueValidator(0)])
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["invoice", "id"]
        verbose_name = "Invoice Line"
        verbose_name_plural = "Invoice Lines"

    def __str__(self) -> str:
        label = self.description or (self.bill.bill_type.name if self.bill else "")
        return f"{self.invoice.invoice_no}: {label} - {self.amount}"


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
        indexes = [
            models.Index(fields=["payment_ref"]),
            models.Index(fields=["invoice"]),
        ]
        verbose_name = "Payment"
        verbose_name_plural = "Payments"

    def __str__(self) -> str:
        return f"{self.payment_ref} - {self.amount} ({self.status})"

    def confirm(self, paid_at=None):
        """
        Mark this payment as confirmed and update related invoice totals.
        """
        self.status = self.STATUS_CONFIRMED
        self.paid_at = paid_at or timezone.now()
        self.save(update_fields=["status", "paid_at"])
        # propagate to invoice
        # invoice.recalc_totals will use payments with STATUS_CONFIRMED
        self.invoice.recalc_totals()
