import uuid
from django.db import models
from django.conf import settings


class PaymentRecord(models.Model):
    METHOD_CHOICES = [
        ("WALLET", "Wallet"),
        ("BANK_TRANSFER", "Bank Transfer"),
        ("CASH", "Cash"),
        ("OTHER", "Other"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice = models.ForeignKey("bills.Invoice", on_delete=models.CASCADE, related_name="payment_records")
    tenant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="payment_records")
    method = models.CharField(max_length=20, choices=METHOD_CHOICES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    reference = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=20, default="SUCCESS")  # can add FAILED/PENDING
    created_at = models.DateTimeField(auto_now_add=True)
    confirmed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="confirmed_payment_records",
        help_text="If manual, which Property Manager confirmed",
    )

    def __str__(self):
        return f"PaymentRecord({self.id}) - {self.method} - {self.amount}"
