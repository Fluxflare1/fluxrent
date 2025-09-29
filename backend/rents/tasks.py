# backend/rents/tasks.py
from celery import shared_task
from django.utils import timezone
from decimal import Decimal
from django.db import transaction
from .models import RentInvoice, LateFeeRule, Tenancy
from datetime import timedelta
from django.conf import settings

@shared_task
def apply_late_fees():
    """
    Scheduled task run daily:
    - Finds rent invoices that are overdue past grace_days for their property
    - Creates a new RentInvoice for the calculated late fee OR attaches a late-fee invoice if not already created
    - Idempotent: ensures no duplicate late-fee invoice created for the same source invoice (by description check)
    """
    today = timezone.now().date()
    # Select invoices overdue and not paid/cancelled
    overdue_invoices = RentInvoice.objects.filter(status__in=["pending", "partially_paid", "overdue"], due_date__lt=today)

    created_count = 0
    for inv in overdue_invoices.select_related("tenancy", "tenancy__apartment", "tenancy__apartment__property"):
        try:
            prop = inv.tenancy.apartment.property
        except Exception:
            continue

        try:
            rule = getattr(prop, "late_fee_rule", None)
        except Exception:
            rule = None

        # if no rule or rule disabled -> skip
        if not rule or not rule.enabled:
            continue

        # Determine days past due and compare to grace_days
        days_past = (today - inv.due_date).days
        if days_past <= rule.grace_days:
            continue

        # Avoid duplicate creation: check for an existing late-fee invoice referencing this invoice
        sentinel_desc = f"Late fee for invoice {inv.uid}"
        existing = RentInvoice.objects.filter(tenancy=inv.tenancy, description__icontains=sentinel_desc).first()
        if existing:
            continue

        # Calculate fee: percentage on original invoice amount + fixed_amount
        percent_part = (inv.amount * (rule.percentage / Decimal("100.00"))) if rule.percentage else Decimal("0.00")
        fixed_part = rule.fixed_amount or Decimal("0.00")
        fee_amt = (percent_part + fixed_part).quantize(Decimal("0.01"))

        if fee_amt <= 0:
            continue

        # Create a late-fee invoice (due immediately)
        with transaction.atomic():
            RentInvoice.objects.create(
                tenancy=inv.tenancy,
                due_date=today,
                amount=fee_amt,
                description=f"{sentinel_desc} (applied {today.isoformat()})"
            )
            created_count += 1

    return {"created": created_count}
