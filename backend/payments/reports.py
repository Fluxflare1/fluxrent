# backend/payments/reports.py
from decimal import Decimal
from django.db.models import Sum, F
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.utils.dateparse import parse_date

from bills.models import Invoice
from .models import PaymentRecord, Prepayment
from django.db.models.functions import TruncDay


class IsOwnerOrStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_staff  # platform owner or superuser


class SummaryReportView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrStaff]

    def get(self, request):
        """
        Returns totals for a period. Query params: start=YYYY-MM-DD, end=YYYY-MM-DD
        """
        start = request.query_params.get("start")
        end = request.query_params.get("end")
        qs_payments = PaymentRecord.objects.filter(status="success")
        qs_invoices = Invoice.objects.all()

        if start:
            sdate = parse_date(start)
            qs_payments = qs_payments.filter(created_at__date__gte=sdate)
            qs_invoices = qs_invoices.filter(issued_at__date__gte=sdate)
        if end:
            edate = parse_date(end)
            qs_payments = qs_payments.filter(created_at__date__lte=edate)
            qs_invoices = qs_invoices.filter(issued_at__date__lte=edate)

        total_collected = qs_payments.aggregate(total=Sum("amount"))["total"] or Decimal("0.00")
        total_invoiced = qs_invoices.aggregate(total=Sum("total_amount"))["total"] or Decimal("0.00")
        total_outstanding = (total_invoiced - total_collected) if total_invoiced and total_collected else (total_invoiced or Decimal("0.00"))

        prepayment_balance = Prepayment.objects.aggregate(total=Sum("remaining"))["total"] or Decimal("0.00")

        return Response({
            "total_invoiced": str(total_invoiced),
            "total_collected": str(total_collected),
            "total_outstanding": str(total_outstanding),
            "prepayment_balance": str(prepayment_balance),
        })


class MethodBreakdownView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrStaff]

    def get(self, request):
        qs = PaymentRecord.objects.filter(status="success").values("method").annotate(total=Sum("amount")).order_by("-total")
        data = [{"method": row["method"], "total": str(row["total"])} for row in qs]
        return Response({"breakdown": data})


class PortfolioOutstandingView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrStaff]

    def get(self, request):
        """
        Outstanding by property. Groups invoices by tenant_apartment -> apartment -> property.
        Returns property uid/name and outstanding value.
        """
        # aggregate per property via joins
        from django.db.models import Sum
        invoices = Invoice.objects.select_related("tenant_apartment__apartment__property")
        property_out = {}

        for inv in invoices:
            prop = getattr(inv.tenant_apartment.apartment, "property", None)
            if prop is None:
                continue
            paid_sum = PaymentRecord.objects.filter(invoice=inv, status="success").aggregate(total=Sum("amount"))["total"] or Decimal("0.00")
            outstanding = Decimal(inv.total_amount) - Decimal(paid_sum)
            if outstanding <= Decimal("0.00"):
                continue
            key = f"{prop.uid}::{prop.name}"
            property_out.setdefault(key, Decimal("0.00"))
            property_out[key] += outstanding

        result = [{"property": k.split("::")[1], "property_uid": k.split("::")[0], "outstanding": str(v)} for k, v in property_out.items()]
        return Response({"portfolio_outstanding": result})
