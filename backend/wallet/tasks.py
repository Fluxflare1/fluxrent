from celery import shared_task
from django.utils.timezone import now
from bills.models import Invoice, PaymentRecord  # ← Ensure PaymentRecord is imported
from .models import StandingOrder, WalletTransaction

@shared_task
def process_standing_orders():
    """
    Runs daily → finds due invoices and auto-debits from linked wallets.
    """
    today = now().date()
    orders = StandingOrder.objects.filter(is_active=True)

    for order in orders:
        wallet = order.wallet
        invoices = Invoice.objects.filter(
            tenant_apartment=order.tenant_apartment,
            due_date__lte=today,
            status="pending"
        )

        if not order.pay_all_bills and order.bill_types:
            invoices = invoices.filter(category__in=order.bill_types)

        for invoice in invoices:
            if wallet.balance >= invoice.amount:
                # Deduct from wallet
                wallet.balance -= invoice.amount
                wallet.save()

                # Create wallet transaction
                WalletTransaction.objects.create(
                    wallet=wallet,
                    txn_type="auto_deduct",
                    amount=invoice.amount,
                    description=f"Auto-deduction for Invoice {invoice.uid}",
                    status="success"
                )

                # CREATE PaymentRecord for billing system tracking
                PaymentRecord.objects.create(
                    invoice=invoice,
                    amount_paid=invoice.amount,
                    paid_at=now(),
                    method="wallet_auto"  # ← This requires the updated PaymentRecord
                )

                invoice.status = "paid"
                invoice.save()

            else:
                # Insufficient funds → notification + leave pending
                WalletTransaction.objects.create(
                    wallet=wallet,
                    txn_type="auto_deduct",
                    amount=invoice.amount,
                    description=f"FAILED auto-deduction for Invoice {invoice.uid} (Insufficient funds)",
                    status="failed"
                )
                # TODO: trigger notification here
