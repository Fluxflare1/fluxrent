from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from wallets.models import WalletTransaction
from payments.models import PaymentRecord
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


def log_payment(invoice, user, method, amount, wallet=None, confirmed_by=None):
    """
    Creates both WalletTransaction + PaymentRecord for accounting.
    """
    # WalletTransaction (wallet may be None if manual)
    WalletTransaction.objects.create(
        wallet=wallet,
        invoice=invoice,
        amount=amount,
        type="CREDIT",
        source=method,
        reference=f"INV-{invoice.id}-{timezone.now().timestamp()}",
        status="SUCCESS",
    )

    # PaymentRecord (always required for reconciliation)
    PaymentRecord.objects.create(
        invoice=invoice,
        tenant=user,
        method=method,
        amount=amount,
        reference=f"PAY-{invoice.id}-{timezone.now().timestamp()}",
        status="SUCCESS",
        confirmed_by=confirmed_by,
    )
