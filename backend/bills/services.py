from decimal import Decimal
from django.db import transaction
from wallets.models import WalletTransaction
from .models import Invoice


def pay_invoice_with_wallet(invoice: Invoice, wallet):
    """
    Deducts invoice amount from Wallet and marks it paid.
    """
    if invoice.status == "PAID":
        raise ValueError("Invoice already paid")

    if wallet.balance < invoice.amount:
        raise ValueError("Insufficient wallet balance")

    with transaction.atomic():
        # Deduct wallet
        wallet.balance -= invoice.amount
        wallet.save()

        # Create transaction record
        WalletTransaction.objects.create(
            wallet=wallet,
            amount=invoice.amount,
            type="DEBIT",
            source="BILL",
            reference=f"INV-{invoice.id}",
            status="SUCCESS",
        )

        # Mark invoice paid
        invoice.status = "PAID"
        invoice.save()

    return True
