from django.utils.timezone import now
from celery import shared_task
from wallet.models.transaction import Transaction
from wallet.models.refund import Refund
from wallet.models.audit import AuditLog
from notifications.utils import notify_admins

@shared_task
def process_auto_refunds():
    """
    Scan for failed transactions older than 7 days and issue refunds automatically.
    """
    cutoff = now() - timedelta(days=7)
    failed_txns = Transaction.objects.filter(
        status="failed", created_at__lte=cutoff
    ).exclude(refund__isnull=False)

    for txn in failed_txns:
        try:
            # Create refund record
            refund = txn.create_refund(
                requested_by=None,  # system
                amount=txn.amount,
                charge=txn.charge
            )
            refund.auto_generated = True
            refund.set_hold_period(days=0)  # already past 7 days
            refund.status = "approved"
            refund.save()

            # Create reverse transaction
            Transaction.objects.create(
                wallet=txn.wallet,
                amount=-refund.amount,
                charge=-refund.charge,
                net_amount=-(refund.total_refund),
                reference=f"AUTO-RFND-{txn.reference}",
                type="refund",
                status="success",
                meta={"original_txn": txn.reference, "auto": True}
            )

            refund.status = "completed"
            refund.save()

            # Log in audit
            AuditLog.objects.create(
                reference=txn.reference,
                action="reconciliation",
                details={
                    "message": "Auto-refund issued after 7-day hold",
                    "amount": str(refund.total_refund),
                    "auto": True
                }
            )

            notify_admins(
                subject="Auto Refund Issued",
                message=f"Refund for transaction {txn.reference} (₦{refund.total_refund}) has been auto-processed."
            )

        except Exception as e:
            AuditLog.objects.create(
                reference=txn.reference,
                action="discrepancy",
                details={"message": "Auto-refund failed", "error": str(e)}
            )

            notify_admins(
                subject="Auto Refund Failed",
                message=f"Refund for transaction {txn.reference} failed.\nError: {str(e)}"
            )
