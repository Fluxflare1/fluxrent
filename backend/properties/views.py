from rest_framework import viewsets, permissions
from .models import Property, Apartment
from .serializers import PropertySerializer, ApartmentSerializer


class IsPropertyManagerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        # Only property manager can edit their own property/apartment
        return obj.manager == request.user or getattr(obj, "property", None) and obj.property.manager == request.user


class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    permission_classes = [IsPropertyManagerOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(manager=self.request.user)


class ApartmentViewSet(viewsets.ModelViewSet):
    queryset = Apartment.objects.all()
    serializer_class = ApartmentSerializer
    permission_classes = [IsPropertyManagerOrReadOnly]












# backend/properties/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django.db.models import Count, Sum, F
from django.utils.timezone import now
from datetime import timedelta

from .models.listings import PropertyListing
from .models.units import ApartmentUnit
from .models.media import PropertyMedia
from .models.inspection import InspectionBooking
from .models.messaging import MessageThread, Message
from .models.engagement import ListingEngagement
from .serializers import (
    PropertyListingSerializer,
    ApartmentUnitSerializer,
    PropertyMediaSerializer,
    InspectionBookingSerializer,
)
from .services.search import SearchRankingService


class IsOwnerOrAgentOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner == request.user or obj.agent == request.user or request.user.is_staff


class PropertyListingViewSet(viewsets.ModelViewSet):
    queryset = PropertyListing.objects.all().prefetch_related("media", "units", "engagement")
    serializer_class = PropertyListingSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        # Only published for anon users
        if not self.request.user.is_authenticated:
            qs = qs.filter(is_published=True)
        # filters
        params = self.request.query_params
        model_type = params.get("model_type")
        min_price = params.get("min_price")
        max_price = params.get("max_price")
        bedrooms = params.get("bedrooms")
        q = params.get("q")
        if model_type:
            qs = qs.filter(model_type=model_type)
        if min_price:
            qs = qs.filter(base_price__gte=min_price)
        if max_price:
            qs = qs.filter(base_price__lte=max_price)
        if bedrooms:
            qs = qs.filter(bedrooms__gte=bedrooms)
        if q:
            qs = qs.filter(title__icontains=q) | qs.filter(description__icontains=q) | qs.filter(address__icontains=q)
        # order by boosted and ranking
        qs = qs.order_by(F("is_boosted").desc(nulls_last=True), "-ranking_score", "-created_at")
        return qs

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def publish(self, request, pk=None):
        listing = self.get_object()
        if listing.owner != request.user and not request.user.is_staff and listing.agent != request.user:
            return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        listing.is_published = True
        listing.save(update_fields=["is_published"])
        return Response({"status": "published"})

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def unpublish(self, request, pk=None):
        listing = self.get_object()
        if listing.owner != request.user and not request.user.is_staff and listing.agent != request.user:
            return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        listing.is_published = False
        listing.save(update_fields=["is_published"])
        return Response({"status": "unpublished"})


class ApartmentUnitViewSet(viewsets.ModelViewSet):
    queryset = ApartmentUnit.objects.all()
    serializer_class = ApartmentUnitSerializer
    permission_classes = [permissions.IsAuthenticated]


class PropertyMediaViewSet(viewsets.ModelViewSet):
    queryset = PropertyMedia.objects.all()
    serializer_class = PropertyMediaSerializer
    permission_classes = [permissions.IsAuthenticated]


class InspectionBookingViewSet(viewsets.ModelViewSet):
    queryset = InspectionBooking.objects.all()
    serializer_class = InspectionBookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        booking = serializer.save(tenant=self.request.user)
        # increment engagement if exists
        listing = booking.listing
        if hasattr(listing, "engagement"):
            listing.engagement.increment_inspections()
        # Update ranking
        from .signals import update_listing_ranking
        update_listing_ranking(listing)


# Reporting endpoint for admin(s)
@api_view(["GET"])
def engagement_report(request):
    """
    /properties/reports/engagement/?window=7&top=20
    Returns top viewed listings and aggregates per owner/agent.
    """
    if not request.user.is_staff:
        return Response({"detail": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)

    window_days = int(request.query_params.get("window", 7))
    top_n = int(request.query_params.get("top", 20))
    since = now() - timedelta(days=window_days)

    # Top listings by views in window: rely on ListingEngagement.last_viewed & views total
    listings = PropertyListing.objects.filter(engagement__last_viewed__gte=since).annotate(
        total_views=F("engagement__views"),
        total_inspections=F("engagement__inspections"),
        total_inquiries=F("engagement__inquiries"),
    ).order_by("-total_views")[:top_n]

    listings_data = PropertyListingSerializer(listings, many=True, context={"request": request}).data

    owner_agg = (
        PropertyListing.objects.filter(engagement__last_viewed__gte=since)
        .values(owner_id=F("owner__id"), owner_email=F("owner__email"))
        .annotate(total_views=Sum("engagement__views"), total_inspections=Sum("engagement__inspections"))
        .order_by("-total_views")
    )

    agent_agg = (
        PropertyListing.objects.filter(engagement__last_viewed__gte=since, agent__isnull=False)
        .values(agent_id=F("agent__id"), agent_email=F("agent__email"))
        .annotate(total_views=Sum("engagement__views"), total_inspections=Sum("engagement__inspections"))
        .order_by("-total_views")
    )

    return Response(
        {
            "top_listings": listings_data,
            "owner_aggregation": list(owner_agg),
            "agent_aggregation": list(agent_agg),
        }
    )
