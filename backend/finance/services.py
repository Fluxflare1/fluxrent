# backend/finance/services.py
from decimal import Decimal, ROUND_DOWN
from django.db import transaction
from .models import FeeConfig, TransactionAudit

DEFAULT_CURRENCY = "NGN"


def compute_fee(channel: str, gross_amount: Decimal) -> (Decimal, Decimal):
    """
    Returns (fee_amount, net_amount)
    """
    try:
        fee = FeeConfig.objects.filter(channel=channel, active=True).first()
    except Exception:
        fee = None

    if not fee:
        return Decimal("0.00"), gross_amount.quantize(Decimal("0.01"))

    percent_fee = (gross_amount * (fee.percent / Decimal("100.0")))
    fee_amount = (percent_fee + fee.fixed).quantize(Decimal("0.01"), rounding=ROUND_DOWN)
    net = (gross_amount - fee_amount).quantize(Decimal("0.01"), rounding=ROUND_DOWN)
    if net < 0:
        net = Decimal("0.00")
    return fee_amount, net


def create_audit_from_wallet_tx(tx):
    """
    tx : instance of wallet.models.WalletTransaction
    Creates TransactionAudit representing that wallet txn.
    """
    gross = Decimal(tx.amount or 0)
    channel = "wallet_transfer" if tx.txn_type in ("transfer", "debit", "fund", "auto_deduct") else "platform"
    fee_amount, net = compute_fee(channel, gross)
    with transaction.atomic():
        audit = TransactionAudit.objects.create(
            wallet_transaction_id=getattr(tx, "uid", str(getattr(tx, "id", ""))),
            source_wallet_uid=getattr(tx.wallet, "uid", None),
            destination_wallet_uid=None,
            channel=channel,
            gross_amount=gross,
            fee_amount=fee_amount,
            net_amount=net,
            currency=DEFAULT_CURRENCY,
            reference=tx.reference,
            status="success" if tx.status == "success" else "pending",
            meta={"txn_type": tx.txn_type, "description": tx.description},
        )
    return audit


def create_audit_from_payment_record(pay):
    """
    pay: instance of payments.models.PaymentRecord
    """
    gross = Decimal(pay.amount or 0)
    # determine channel
    if pay.method in ("wallet_manual", "wallet_auto"):
        channel = "wallet_transfer"
    elif pay.method in ("bank", "card", "external_gateway"):
        channel = "paystack"
    elif pay.method == "cash":
        channel = "platform"
    else:
        channel = "platform"

    fee_amount, net = compute_fee(channel, gross)
    with transaction.atomic():
        audit = TransactionAudit.objects.create(
            payment_record_id=getattr(pay, "uid", str(getattr(pay, "id", ""))),
            source_wallet_uid=None,
            destination_wallet_uid=None,
            invoice_uid=getattr(pay.invoice, "uid", None) if getattr(pay, "invoice", None) else None,
            tenant_id=getattr(pay.tenant, "uid", None) if getattr(pay, "tenant", None) else None,
            channel=channel,
            gross_amount=gross,
            fee_amount=fee_amount,
            net_amount=net,
            currency=DEFAULT_CURRENCY,
            reference=getattr(pay, "reference", None),
            status="success" if pay.status == "success" else "pending",
            meta={"payment_method": pay.method},
        )
    return audit
