# backend/finance/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings

from wallet.models import WalletTransaction  # existing model
from payments.models import PaymentRecord  # existing model

from .services import create_audit_from_wallet_tx, create_audit_from_payment_record


@receiver(post_save, sender=WalletTransaction)
def wallet_tx_post_save(sender, instance: WalletTransaction, created, **kwargs):
    # create audit record for this transaction (idempotent: don't duplicate if already created)
    # use wallet_transaction_id matching UID
    from finance.models import TransactionAudit

    exists = TransactionAudit.objects.filter(wallet_transaction_id=getattr(instance, "uid", None)).exists()
    if not exists:
        create_audit_from_wallet_tx(instance)


@receiver(post_save, sender=PaymentRecord)
def payment_record_post_save(sender, instance: PaymentRecord, created, **kwargs):
    from finance.models import TransactionAudit

    exists = TransactionAudit.objects.filter(payment_record_id=getattr(instance, "uid", None)).exists()
    if not exists:
        create_audit_from_payment_record(instance)
