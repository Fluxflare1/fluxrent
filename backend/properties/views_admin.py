from django.db.models import Count, Sum
from rest_framework.permissions import IsAdminUser
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Property, BoostPaymentLog


class BoostsTopView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        period = request.query_params.get("period", "monthly")
        qs = BoostPaymentLog.objects.values("property__title").annotate(
            count=Count("id"), total=Sum("amount")
        ).order_by("-count")[:10]
        return Response(list(qs))


class BoostsRevenueView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        qs = BoostPaymentLog.objects.aggregate(total=Sum("amount"))
        return Response(qs)



from datetime import timedelta
from django.utils.timezone import now
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions

from .models import Property, BoostPaymentLog


class BoostAnalyticsView(APIView):
    """
    Admin analytics for Boosts.
    Shows top boosted listings and revenue by period.
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        # Filters
        period = request.query_params.get("period", "30d")  # default last 30 days
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

        # Top properties by boost revenue
        property_stats = (
            logs.values("property_id")
            .annotate(boost_count=models.Count("id"), revenue=models.Sum("amount"))
            .order_by("-revenue")[:10]
        )

        # Attach property details
        property_ids = [p["property_id"] for p in property_stats]
        props = {p.id: p for p in Property.objects.filter(id__in=property_ids)}

        results = []
        for stat in property_stats:
            prop = props.get(stat["property_id"])
            if not prop:
                continue
            results.append({
                "property_id": prop.id,
                "title": prop.title,
                "boost_count": stat["boost_count"],
                "revenue": stat["revenue"],
            })

        return Response({
            "period_start": since,
            "total_revenue": total_revenue,
            "top_properties": results,
        })
