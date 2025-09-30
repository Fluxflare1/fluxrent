# backend/properties/views/listings.py
from django.contrib.gis.geos import Polygon, Point
from django.contrib.gis.db.models.functions import Distance
from django.db.models import Q
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models.listings import (
    PropertyListing,
    ListingPhoto,
    InspectionBooking,
    SearchOptimization,
)
from .serializers.listings import (
    PropertyListingSerializer,
    ListingPhotoSerializer,
    InspectionBookingSerializer,
    SearchOptimizationSerializer,
)
from .services.search import SearchRankingService


class PropertyListingViewSet(viewsets.ModelViewSet):
    """
    Extended listing viewset that supports:
      - filtering (price, bedrooms, bathrooms, toilets, listing_type)
      - bounding-box search via `bounds=sw_lng,sw_lat,ne_lng,ne_lat`
      - center/radius search via lat,lng,radius (km)
      - text query via ?query=
      - ranking ordering (boost + ranking_score + recency)
      - pagination
    """
    queryset = PropertyListing.objects.all().prefetch_related("photos", "optimization", "engagement")
    serializer_class = PropertyListingSerializer
    permission_classes = [permissions.AllowAny]  # Listings are public for search

    def _apply_filters(self, qs):
        params = self.request.query_params

        # Basic filters
        listing_type = params.get("listing_type")
        min_price = params.get("min_price")
        max_price = params.get("max_price")
        bedrooms = params.get("bedrooms")
        bathrooms = params.get("bathrooms")
        toilets = params.get("toilets")
        qtext = params.get("query")

        if listing_type:
            qs = qs.filter(listing_type=listing_type)
        if min_price:
            try:
                qs = qs.filter(price__gte=float(min_price))
            except Exception:
                pass
        if max_price:
            try:
                qs = qs.filter(price__lte=float(max_price))
            except Exception:
                pass
        if bedrooms:
            try:
                qs = qs.filter(bedrooms__gte=int(bedrooms))
            except Exception:
                pass
        if bathrooms:
            try:
                qs = qs.filter(bathrooms__gte=int(bathrooms))
            except Exception:
                pass
        if toilets:
            try:
                qs = qs.filter(toilets__gte=int(toilets))
            except Exception:
                pass

        # Text search: simple IContains on title/description
        if qtext:
            qs = qs.filter(Q(title__icontains=qtext) | Q(description__icontains=qtext))

        # Bounding box search: bounds=sw_lng,sw_lat,ne_lng,ne_lat
        bounds = params.get("bounds")
        if bounds:
            try:
                parts = [float(p) for p in bounds.split(",")]
                if len(parts) == 4:
                    sw_lng, sw_lat, ne_lng, ne_lat = parts
                    # Polygon expects coordinates in (lng, lat) tuples in order
                    poly = Polygon(
                        (
                            (sw_lng, sw_lat),
                            (sw_lng, ne_lat),
                            (ne_lng, ne_lat),
                            (ne_lng, sw_lat),
                            (sw_lng, sw_lat),
                        ),
                        srid=4326,
                    )
                    qs = qs.filter(location__within=poly)
            except Exception:
                pass

        # Center + radius search: lat, lng, radius(km)
        lat = params.get("lat")
        lng = params.get("lng")
        radius = params.get("radius")
        if lat and lng:
            try:
                pt = Point(float(lng), float(lat), srid=4326)
                if radius:
                    # Distance expects meters when geography=True; convert km -> meters
                    meters = float(radius) * 1000.0
                    qs = qs.annotate(distance=Distance("location", pt)).filter(distance__lte=meters)
                else:
                    qs = qs.annotate(distance=Distance("location", pt))
            except Exception:
                pass

        return qs

    def get_queryset(self):
        qs = super().get_queryset().filter(is_published=True)
        qs = self._apply_filters(qs)

        # Ranking: prioritise boost_score, then ranking_score (precomputed), then recency
        qs = qs.order_by("-optimization__boost_score", "-ranking_score", "-created_at")
        return qs

    def list(self, request, *args, **kwargs):
        qs = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        listing = self.get_object()
        listing.is_published = True
        listing.save(update_fields=["is_published"])
        # Recompute ranking immediately
        try:
            SearchRankingService.calculate_total_ranking(listing)
            listing.ranking_score = SearchRankingService.calculate_total_ranking(listing)
            listing.save(update_fields=["ranking_score"])
        except Exception:
            pass
        return Response({"status": "published"})

    @action(detail=True, methods=["post"])
    def unpublish(self, request, pk=None):
        listing = self.get_object()
        listing.is_published = False
        listing.save(update_fields=["is_published"])
        return Response({"status": "unpublished"})


class ListingPhotoViewSet(viewsets.ModelViewSet):
    queryset = ListingPhoto.objects.all()
    serializer_class = ListingPhotoSerializer
    permission_classes = [permissions.IsAuthenticated]


class InspectionBookingViewSet(viewsets.ModelViewSet):
    queryset = InspectionBooking.objects.all()
    serializer_class = InspectionBookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=["patch"])
    def approve(self, request, pk=None):
        booking = self.get_object()
        booking.status = InspectionBooking.Status.APPROVED
        booking.save(update_fields=["status"])
        return Response({"status": "approved"})

    @action(detail=True, methods=["patch"])
    def reject(self, request, pk=None):
        booking = self.get_object()
        booking.status = InspectionBooking.Status.REJECTED
        booking.save(update_fields=["status"])
        return Response({"status": "rejected"})


class SearchOptimizationViewSet(viewsets.ModelViewSet):
    queryset = SearchOptimization.objects.all()
    serializer_class = SearchOptimizationSerializer
    permission_classes = [permissions.IsAdminUser]
