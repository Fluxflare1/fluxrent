# backend/properties/views_admin.py
from datetime import timedelta
from django.utils.timezone import now
from django.db import models
from django.db.models import Count, Sum
from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Property, BoostPaymentLog


class BoostsTopView(APIView):
    """Top boosted properties by count & total amount (all time)."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        qs = (
            BoostPaymentLog.objects.values("property__title")
            .annotate(count=Count("id"), total=Sum("amount"))
            .order_by("-count")[:10]
        )
        return Response(list(qs))


class BoostsRevenueView(APIView):
    """Total revenue from boosts (all time)."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        qs = BoostPaymentLog.objects.aggregate(total=Sum("amount"))
        return Response(qs)


class BoostAnalyticsView(APIView):
    """
    Admin analytics for Boosts.
    Shows total revenue + top boosted listings by period.
    Period formats:
      - "30d" → last 30 days
      - "3m"  → last 3 months
      - defaults to 30 days if invalid
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        # Parse period filter
        period = request.query_params.get("period", "30d")
        if period.endswith("d"):
            days = int(period[:-1])
            since = now() - timedelta(days=days)
        elif period.endswith("m"):
            months = int(period[:-1])
            since = now() - timedelta(days=30 * months)
        else:
            since = now() - timedelta(days=30)

        logs = BoostPaymentLog.objects.filter(status="success", created_at__gte=since)

        # Total revenue
        total_revenue = logs.aggregate(total=models.Sum("amount"))["total"] or 0

        # Top boosted properties by revenue
        property_stats = (
            logs.values("property_id")
            .annotate(boost_count=models.Count("id"), revenue=models.Sum("amount"))
            .order_by("-revenue")[:10]
        )

        # Fetch property details
        property_ids = [p["property_id"] for p in property_stats]
        props = {p.id: p for p in Property.objects.filter(id__in=property_ids)}

        results = []
        for stat in property_stats:
            prop = props.get(stat["property_id"])
            if not prop:
                continue
            results.append(
                {
                    "property_id": prop.id,
                    "title": prop.title,
                    "boost_count": stat["boost_count"],
                    "revenue": stat["revenue"],
                }
            )

        return Response(
            {
                "period_start": since,
                "total_revenue": total_revenue,
                "top_properties": results,
            }
        )
