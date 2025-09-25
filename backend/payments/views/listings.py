from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.geos import Point
from django.db.models import Q

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


class PropertyListingViewSet(viewsets.ModelViewSet):
    queryset = PropertyListing.objects.all().prefetch_related("photos")
    serializer_class = PropertyListingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset().filter(is_published=True)
        # Apply filters for search
        listing_type = self.request.query_params.get("listing_type")
        min_price = self.request.query_params.get("min_price")
        max_price = self.request.query_params.get("max_price")
        bedrooms = self.request.query_params.get("bedrooms")
        bathrooms = self.request.query_params.get("bathrooms")
        toilets = self.request.query_params.get("toilets")
        lat = self.request.query_params.get("lat")
        lng = self.request.query_params.get("lng")
        radius = self.request.query_params.get("radius", 10)

        if listing_type:
            qs = qs.filter(listing_type=listing_type)
        if min_price:
            qs = qs.filter(price__gte=min_price)
        if max_price:
            qs = qs.filter(price__lte=max_price)
        if bedrooms:
            qs = qs.filter(bedrooms__gte=bedrooms)
        if bathrooms:
            qs = qs.filter(bathrooms__gte=bathrooms)
        if toilets:
            qs = qs.filter(toilets__gte=toilets)
        if lat and lng:
            user_location = Point(float(lng), float(lat), srid=4326)
            qs = qs.annotate(distance=Distance("location", user_location)).filter(
                location__distance_lte=(user_location, radius * 1000)
            )

        # Ranking (boost_score + recency)
        qs = qs.order_by("-optimization__boost_score", "-created_at")
        return qs

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        listing = self.get_object()
        listing.is_published = True
        listing.save()
        return Response({"status": "published"})

    @action(detail=True, methods=["post"])
    def unpublish(self, request, pk=None):
        listing = self.get_object()
        listing.is_published = False
        listing.save()
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
        booking.save()
        return Response({"status": "approved"})

    @action(detail=True, methods=["patch"])
    def reject(self, request, pk=None):
        booking = self.get_object()
        booking.status = InspectionBooking.Status.REJECTED
        booking.save()
        return Response({"status": "rejected"})


class SearchOptimizationViewSet(viewsets.ModelViewSet):
    queryset = SearchOptimization.objects.all()
    serializer_class = SearchOptimizationSerializer
    permission_classes = [permissions.IsAdminUser]
