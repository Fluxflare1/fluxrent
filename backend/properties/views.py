# backend/properties/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count, Sum, F, Q
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
    PropertyListingCreateSerializer,
    PropertyListingSummarySerializer,
    ApartmentUnitSerializer,
    PropertyMediaSerializer,
    InspectionBookingSerializer,
    MessageThreadSerializer,
    MessageSerializer
)


class IsOwnerOrAgentOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners, agents, or staff to edit objects.
    Read-only for safe methods.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Handle different object types
        if hasattr(obj, 'owner') and hasattr(obj, 'agent'):
            # For PropertyListing
            return obj.owner == request.user or obj.agent == request.user or request.user.is_staff
        elif hasattr(obj, 'listing'):
            # For ApartmentUnit, PropertyMedia - check parent listing permissions
            listing = obj.listing
            return listing.owner == request.user or listing.agent == request.user or request.user.is_staff
        elif hasattr(obj, 'manager'):
            # For legacy Property model compatibility
            return obj.manager == request.user or request.user.is_staff
        else:
            return request.user.is_staff


class IsInspectionParticipantOrReadOnly(permissions.BasePermission):
    """
    Permission for inspection bookings - allow tenants, listing owners/agents, and staff
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Tenant can update their own booking (cancel, etc.)
        if obj.tenant == request.user:
            return True
        
        # Listing owner/agent can update status
        listing = obj.listing
        if listing.owner == request.user or listing.agent == request.user:
            return True
        
        return request.user.is_staff


class PropertyListingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for PropertyListing with advanced filtering and search
    """
    queryset = PropertyListing.objects.all().prefetch_related("media", "units", "engagement")
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrAgentOrReadOnly]

    def get_serializer_class(self):
        if self.action == 'create':
            return PropertyListingCreateSerializer
        elif self.action == 'list':
            return PropertyListingSummarySerializer
        return PropertyListingSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        
        # Base filtering based on user type
        if not self.request.user.is_authenticated:
            # Anonymous users only see published listings
            qs = qs.filter(is_published=True)
        elif not self.request.user.is_staff:
            # Authenticated non-staff users see their own listings + published
            qs = qs.filter(
                Q(is_published=True) | 
                Q(owner=self.request.user) | 
                Q(agent=self.request.user)
            )

        # Apply filters from query parameters
        params = self.request.query_params
        
        # Listing type filter
        listing_type = params.get("listing_type")
        if listing_type:
            qs = qs.filter(listing_type=listing_type)
        
        # Price range filters
        min_price = params.get("min_price")
        max_price = params.get("max_price")
        if min_price:
            qs = qs.filter(price__gte=min_price)
        if max_price:
            qs = qs.filter(price__lte=max_price)
        
        # Bedrooms filter
        bedrooms = params.get("bedrooms")
        if bedrooms:
            qs = qs.filter(bedrooms__gte=bedrooms)
        
        # Search query
        search_query = params.get("q")
        if search_query:
            qs = qs.filter(
                Q(title__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(short_description__icontains=search_query) |
                Q(address__icontains=search_query)
            )
        
        # Location-based filtering (simplified - could be enhanced with geo-spatial)
        location_query = params.get("location")
        if location_query:
            qs = qs.filter(address__icontains=location_query)
        
        # Availability filter
        available_only = params.get("available_only")
        if available_only and available_only.lower() == 'true':
            qs = qs.filter(units__is_available=True).distinct()

        # Order by boosted, ranking score, and creation date
        qs = qs.order_by(
            F("is_boosted").desc(nulls_last=True), 
            "-ranking_score", 
            "-created_at"
        )
        
        return qs

    def perform_create(self, serializer):
        """Set the owner when creating a new listing"""
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def publish(self, request, pk=None):
        """Publish a listing"""
        listing = self.get_object()
        if listing.owner != request.user and listing.agent != request.user and not request.user.is_staff:
            return Response(
                {"detail": "You don't have permission to publish this listing."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        listing.is_published = True
        listing.save(update_fields=["is_published"])
        return Response({"status": "published"})

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def unpublish(self, request, pk=None):
        """Unpublish a listing"""
        listing = self.get_object()
        if listing.owner != request.user and listing.agent != request.user and not request.user.is_staff:
            return Response(
                {"detail": "You don't have permission to unpublish this listing."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        listing.is_published = False
        listing.save(update_fields=["is_published"])
        return Response({"status": "unpublished"})

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def boost(self, request, pk=None):
        """Boost a listing (staff only)"""
        if not request.user.is_staff:
            return Response(
                {"detail": "Only staff can boost listings."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        listing = self.get_object()
        boost_days = request.data.get('days', 7)
        listing.boost_until = now() + timedelta(days=boost_days)
        listing.save(update_fields=["boost_until"])
        
        return Response({
            "status": "boosted", 
            "boost_until": listing.boost_until,
            "days": boost_days
        })

    @action(detail=True, methods=["get"])
    def engagement(self, request, pk=None):
        """Get engagement metrics for a listing"""
        listing = self.get_object()
        engagement = getattr(listing, 'engagement', None)
        
        if engagement:
            return Response({
                "views": engagement.views,
                "inspections": engagement.inspections,
                "inquiries": engagement.inquiries,
                "last_viewed": engagement.last_viewed
            })
        return Response({"detail": "No engagement data available."})


class ApartmentUnitViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ApartmentUnit management
    """
    queryset = ApartmentUnit.objects.select_related('listing')
    serializer_class = ApartmentUnitSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAgentOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        
        # Non-staff users only see units from their listings
        if not self.request.user.is_staff:
            qs = qs.filter(
                Q(listing__owner=self.request.user) |
                Q(listing__agent=self.request.user)
            )
        
        # Filter by listing if provided
        listing_id = self.request.query_params.get('listing')
        if listing_id:
            qs = qs.filter(listing_id=listing_id)
        
        # Filter by availability
        available_only = self.request.query_params.get('available_only')
        if available_only and available_only.lower() == 'true':
            qs = qs.filter(is_available=True)
        
        return qs

    def perform_create(self, serializer):
        """Validate that user has permission to add units to this listing"""
        listing = serializer.validated_data['listing']
        if listing.owner != self.request.user and listing.agent != self.request.user and not self.request.user.is_staff:
            raise permissions.PermissionDenied("You don't have permission to add units to this listing.")
        serializer.save()


class PropertyMediaViewSet(viewsets.ModelViewSet):
    """
    ViewSet for PropertyMedia management
    """
    queryset = PropertyMedia.objects.select_related('listing')
    serializer_class = PropertyMediaSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAgentOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        
        # Non-staff users only see media from their listings
        if not self.request.user.is_staff:
            qs = qs.filter(
                Q(listing__owner=self.request.user) |
                Q(listing__agent=self.request.user)
            )
        
        return qs

    def perform_create(self, serializer):
        """Validate permissions and handle cover photo logic"""
        listing = serializer.validated_data['listing']
        if listing.owner != self.request.user and listing.agent != self.request.user and not self.request.user.is_staff:
            raise permissions.PermissionDenied("You don't have permission to add media to this listing.")
        
        # If this is set as cover, it will be handled in the model's save method
        serializer.save()


class InspectionBookingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for InspectionBooking management
    """
    queryset = InspectionBooking.objects.select_related('listing', 'unit', 'tenant')
    serializer_class = InspectionBookingSerializer
    permission_classes = [permissions.IsAuthenticated, IsInspectionParticipantOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        
        # Non-staff users see their own bookings or bookings for their listings
        if not self.request.user.is_staff:
            qs = qs.filter(
                Q(tenant=self.request.user) |
                Q(listing__owner=self.request.user) |
                Q(listing__agent=self.request.user)
            )
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        
        # Filter by upcoming/past
        upcoming_only = self.request.query_params.get('upcoming_only')
        if upcoming_only and upcoming_only.lower() == 'true':
            qs = qs.filter(scheduled_date__gte=now())
        
        return qs.order_by('scheduled_date')

    def perform_create(self, serializer):
        """Set the tenant and update engagement metrics"""
        booking = serializer.save(tenant=self.request.user)
        
        # Update engagement metrics
        listing = booking.listing
        if hasattr(listing, "engagement"):
            listing.engagement.increment_inspections()
        
        # Update ranking score (you can implement this signal)
        # from .signals import update_listing_ranking
        # update_listing_ranking(listing)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def approve(self, request, pk=None):
        """Approve an inspection booking"""
        booking = self.get_object()
        if booking.listing.owner != request.user and booking.listing.agent != request.user and not request.user.is_staff:
            return Response(
                {"detail": "Only the listing owner or agent can approve inspections."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        booking.status = InspectionBooking.Status.APPROVED
        booking.save(update_fields=["status"])
        return Response({"status": "approved"})

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def complete(self, request, pk=None):
        """Mark an inspection as completed"""
        booking = self.get_object()
        if booking.listing.owner != request.user and booking.listing.agent != request.user and not request.user.is_staff:
            return Response(
                {"detail": "Only the listing owner or agent can mark inspections as completed."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        booking.status = InspectionBooking.Status.COMPLETED
        booking.save(update_fields=["status"])
        return Response({"status": "completed"})


# Message Thread and Message ViewSets
class MessageThreadViewSet(viewsets.ModelViewSet):
    """ViewSet for MessageThread management"""
    queryset = MessageThread.objects.select_related('listing', 'created_by').prefetch_related('participants', 'messages')
    serializer_class = MessageThreadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(participants=self.request.user)

    def perform_create(self, serializer):
        thread = serializer.save(created_by=self.request.user)
        thread.participants.add(self.request.user)


class MessageViewSet(viewsets.ModelViewSet):
    """ViewSet for Message management"""
    queryset = Message.objects.select_related('thread', 'sender')
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(thread__participants=self.request.user)

    def perform_create(self, serializer):
        message = serializer.save(sender=self.request.user)
        # Mark as read by sender
        message.read_by.add(self.request.user)


# Reporting endpoints
@api_view(["GET"])
@permission_classes([permissions.IsAdminUser])
def engagement_report(request):
    """
    Admin-only engagement report
    /properties/reports/engagement/?window=7&top=20
    """
    window_days = int(request.query_params.get("window", 7))
    top_n = int(request.query_params.get("top", 20))
    since = now() - timedelta(days=window_days)

    # Top listings by views
    listings = PropertyListing.objects.filter(
        engagement__last_viewed__gte=since
    ).annotate(
        total_views=F("engagement__views"),
        total_inspections=F("engagement__inspections"),
        total_inquiries=F("engagement__inquiries"),
    ).order_by("-total_views")[:top_n]

    listings_data = PropertyListingSummarySerializer(listings, many=True, context={"request": request}).data

    # Owner aggregation
    owner_agg = (
        PropertyListing.objects.filter(engagement__last_viewed__gte=since)
        .values(owner_id=F("owner__id"), owner_email=F("owner__email"))
        .annotate(
            total_views=Sum("engagement__views"),
            total_inspections=Sum("engagement__inspections"),
            total_inquiries=Sum("engagement__inquiries")
        )
        .order_by("-total_views")
    )

    # Agent aggregation
    agent_agg = (
        PropertyListing.objects.filter(engagement__last_viewed__gte=since, agent__isnull=False)
        .values(agent_id=F("agent__id"), agent_email=F("agent__email"))
        .annotate(
            total_views=Sum("engagement__views"),
            total_inspections=Sum("engagement__inspections"),
            total_inquiries=Sum("engagement__inquiries")
        )
        .order_by("-total_views")
    )

    return Response({
        "period": f"Last {window_days} days",
        "top_listings": listings_data,
        "owner_aggregation": list(owner_agg),
        "agent_aggregation": list(agent_agg),
    })
