# backend/rents/views_reports.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.db.models import Sum, F, Count
from django.utils import timezone
from decimal import Decimal
from .models import RentInvoice, RentPayment, Tenancy, LateFeeRule
from django.db import transaction
from datetime import timedelta

class IsPropertyManagerOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (request.user.is_staff or getattr(request.user, "role", None) == "property_manager")

class CollectionSummaryView(APIView):
    """
    Admin/PM report: collection summary for a property manager (or global for admins).
    Query params:
      - property_id (optional) -> filter to specific property
      - from_date, to_date (optional) -> ISO dates to filter payments
    Response:
      totals: { collected, outstanding, invoices_count, paid_count, overdue_count }
      per_property: list of aggregates per property (if PM/admin)
      per_agent: list aggregates per agent (if applicable)
    """
    permission_classes = [permissions.IsAuthenticated, IsPropertyManagerOrAdmin]

    def get(self, request):
        user = request.user
        property_id = request.query_params.get("property_id")
        from_date = request.query_params.get("from_date")
        to_date = request.query_params.get("to_date")

        payments_qs = RentPayment.objects.filter(status="success")
        invoices_qs = RentInvoice.objects.all()

        if getattr(user, "role", None) == "property_manager" and not user.is_staff:
            # Limit to properties managed by this user
            payments_qs = payments_qs.filter(invoice__tenancy__apartment__property__manager=user)
            invoices_qs = invoices_qs.filter(tenancy__apartment__property__manager=user)
        if property_id:
            payments_qs = payments_qs.filter(invoice__tenancy__apartment__property__id=property_id)
            invoices_qs = invoices_qs.filter(tenancy__apartment__property__id=property_id)

        if from_date:
            payments_qs = payments_qs.filter(created_at__date__gte=from_date)
            invoices_qs = invoices_qs.filter(created_at__date__gte=from_date)
        if to_date:
            payments_qs = payments_qs.filter(created_at__date__lte=to_date)
            invoices_qs = invoices_qs.filter(created_at__date__lte=to_date)

        collected = payments_qs.aggregate(total=Sum("amount"))["total"] or Decimal("0.00")
        outstanding = invoices_qs.aggregate(total=Sum("outstanding"))["total"] or Decimal("0.00")
        invoices_count = invoices_qs.count()
        paid_count = invoices_qs.filter(status="paid").count()
        overdue_count = invoices_qs.filter(status="overdue").count()

        # per-property aggregation (top-level)
        per_property = []
        # Only admins get all properties; PMs get their own properties
        from collections import defaultdict
        prop_map = defaultdict(lambda: {"collected": Decimal("0.00"), "outstanding": Decimal("0.00"), "invoices": 0})
        for p in payments_qs.select_related("invoice__tenancy__apartment__property"):
            prop = p.invoice.tenancy.apartment.property
            prop_map[str(prop.uid)]["collected"] += p.amount

        for inv in invoices_qs.select_related("tenancy__apartment__property"):
            prop = inv.tenancy.apartment.property
            prop_map[str(prop.uid)]["outstanding"] += inv.outstanding
            prop_map[str(prop.uid)]["invoices"] += 1

        for uid, data in prop_map.items():
            per_property.append({"property_uid": uid, "collected": data["collected"], "outstanding": data["outstanding"], "invoices": data["invoices"]})

        # per-agent aggregation (if agents exist)
        per_agent = []
        agent_agg = {}
        agent_qs = payments_qs.select_related("invoice__tenancy__apartment__property__manager")
        for p in agent_qs:
            mgr = p.invoice.tenancy.apartment.property.manager
            if not mgr:
                continue
            key = str(mgr.id)
            agent_agg.setdefault(key, {"manager_id": mgr.id, "manager_email": mgr.email, "collected": Decimal("0.00")})
            agent_agg[key]["collected"] += p.amount
        per_agent = list(agent_agg.values())

        return Response({
            "totals": {
                "collected": collected,
                "outstanding": outstanding,
                "invoices_count": invoices_count,
                "paid_count": paid_count,
                "overdue_count": overdue_count
            },
            "per_property": per_property,
            "per_agent": per_agent
        })

class LateFeePreviewApplyView(APIView):
    """
    Preview late fees for a property or tenancy (no changes) or apply them (admin action).
    POST payload:
      - property_id (optional) OR tenancy_id (optional)
      - action: "preview" or "apply"
    Response: list of candidate fees { invoice_id, fee_amount, description }
    """
    permission_classes = [permissions.IsAuthenticated, IsPropertyManagerOrAdmin]

    def post(self, request):
        action = request.data.get("action", "preview")
        property_id = request.data.get("property_id")
        tenancy_id = request.data.get("tenancy_id")
        today = timezone.now().date()

        invoices = RentInvoice.objects.filter(status__in=["pending", "partially_paid", "overdue"], due_date__lt=today)
        if tenancy_id:
            invoices = invoices.filter(tenancy__id=tenancy_id)
        elif property_id:
            invoices = invoices.filter(tenancy__apartment__property__id=property_id)
        else:
            # default: for PM, only their properties; for admin all
            user = request.user
            if getattr(user, "role", None) == "property_manager" and not user.is_staff:
                invoices = invoices.filter(tenancy__apartment__property__manager=user)

        results = []
        for inv in invoices.select_related("tenancy__apartment__property"):
            prop = inv.tenancy.apartment.property
            rule = getattr(prop, "late_fee_rule", None)
            if not rule or not rule.enabled:
                continue
            days_past = (today - inv.due_date).days
            if days_past <= rule.grace_days:
                continue
            # compute fee
            percent_part = (inv.amount * (rule.percentage / Decimal("100.00"))) if rule.percentage else Decimal("0.00")
            fixed_part = rule.fixed_amount or Decimal("0.00")
            fee_amt = (percent_part + fixed_part).quantize(Decimal("0.01"))
            if fee_amt <= 0:
                continue
            results.append({
                "invoice_id": inv.id,
                "invoice_uid": inv.uid,
                "tenancy_uid": inv.tenancy.uid,
                "property_uid": prop.uid,
                "days_past": days_past,
                "fee_amount": str(fee_amt),
                "description": f"Late fee for invoice {inv.uid}"
            })

        if action == "preview":
            return Response({"preview": results})
        elif action == "apply":
            applied = []
            with transaction.atomic():
                for r in results:
                    inv = RentInvoice.objects.get(pk=r["invoice_id"])
                    # idempotent: skip if a late fee invoice already exists for this invoice uid
                    sentinel_desc = f"Late fee for invoice {inv.uid}"
                    exists = RentInvoice.objects.filter(tenancy=inv.tenancy, description__icontains=sentinel_desc).exists()
                    if exists:
                        continue
                    fee_amt = Decimal(r["fee_amount"])
                    new_inv = RentInvoice.objects.create(
                        tenancy=inv.tenancy,
                        due_date=today,
                        amount=fee_amt,
                        description=f"{sentinel_desc} (applied {today.isoformat()})"
                    )
                    applied.append({
                        "created_invoice_id": new_inv.id,
                        "created_invoice_uid": new_inv.uid,
                        "amount": str(fee_amt)
                    })
            return Response({"applied": applied})
        else:
            return Response({"detail": "invalid action"}, status=status.HTTP_400_BAD_REQUEST)
