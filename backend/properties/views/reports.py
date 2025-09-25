from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.utils.timezone import now, timedelta
from django.db.models import Sum

from properties.models.listings import PropertyListing
from properties.models.engagement import ListingEngagement


class EngagementReportView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, *args, **kwargs):
        # Time filters
        period = request.query_params.get("period", "30d")
        cutoff = now() - timedelta(days=30)
        if period == "7d":
            cutoff = now() - timedelta(days=7)

        # Top engaged listings (limit 20)
        top_listings = (
            PropertyListing.objects.filter(created_at__gte=cutoff)
            .select_related("engagement", "owner", "agent")
            .order_by(
                "-engagement__views",
                "-engagement__inspections",
            )[:20]
        )

        top_data = []
        for l in top_listings:
            top_data.append({
                "id": str(l.id),
                "title": l.title,
                "owner": l.owner.get_full_name() if l.owner else None,
                "agent": l.agent.get_full_name() if l.agent else None,
                "views": l.engagement.views if hasattr(l, "engagement") else 0,
                "inspections": l.engagement.inspections if hasattr(l, "engagement") else 0,
                "ranking_score": l.ranking_score,
            })

        # Aggregates by owner
        owner_agg = (
            ListingEngagement.objects.filter(listing__created_at__gte=cutoff)
            .values("listing__owner")
            .annotate(
                total_views=Sum("views"),
                total_inspections=Sum("inspections"),
            )
        )

        # Aggregates by agent
        agent_agg = (
            ListingEngagement.objects.filter(listing__created_at__gte=cutoff)
            .values("listing__agent")
            .annotate(
                total_views=Sum("views"),
                total_inspections=Sum("inspections"),
            )
        )

        return Response({
            "period": period,
            "top_listings": top_data,
            "owner_aggregation": list(owner_agg),
            "agent_aggregation": list(agent_agg),
        })
