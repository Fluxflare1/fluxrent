import uuid
from django.db import models
from django.utils.timezone import now
from bills.models import Invoice
from wallet.models import Wallet, WalletTransaction


def generate_uid(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:10].upper()}"


class PaymentRecord(models.Model):
    """
    Payment lifecycle record. Ties together invoices and wallet/bank/card activity.
    """
    uid = models.CharField(max_length=20, unique=True, default=lambda: generate_uid("PAY"))
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="payment_records")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    method = models.CharField(
        max_length=20,
        choices=[
            ("wallet_auto", "Wallet Auto"),
            ("wallet_manual", "Wallet Manual"),
            ("cash", "Cash"),
            ("bank_transfer", "Bank Transfer"),
            ("card", "Card"),
        ],
    )
    reference = models.CharField(max_length=255, blank=True, null=True)  # external txn ref if any
    created_at = models.DateTimeField(default=now)
    confirmed = models.BooleanField(default=False)  # for PM confirmation in case of cash/bank

    def __str__(self):
        return f"{self.uid} | {self.method} | {self.amount}"
