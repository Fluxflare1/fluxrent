# backend/properties/serializers.py
from rest_framework import serializers
from .models.listings import PropertyListing
from .models.units import ApartmentUnit
from .models.media import PropertyMedia
from .models.inspection import InspectionBooking
from .models.messaging import MessageThread, Message
from .models.engagement import ListingEngagement


class PropertyMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyMedia
        fields = ["id", "media_type", "file", "caption", "is_cover", "created_at"]
        read_only_fields = ["id", "created_at"]


class ApartmentUnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApartmentUnit
        fields = [
            "id", "uid", "listing", "apartment_type", "name", "floor",
            "rooms", "bedrooms", "bathrooms", "toilets", "ensuites",
            "visitors_toilet", "rent_amount", "lease_amount", "facilities",
            "is_available", "created_at"
        ]
        read_only_fields = ["id", "uid", "created_at"]


class ListingEngagementSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingEngagement
        fields = ["views", "inspections", "inquiries", "last_viewed"]
        read_only_fields = ["views", "inspections", "inquiries", "last_viewed"]


class PropertyListingSerializer(serializers.ModelSerializer):
    # Nested serializers for related objects
    media = PropertyMediaSerializer(many=True, read_only=True)
    units = ApartmentUnitSerializer(many=True, read_only=True)
    engagement = ListingEngagementSerializer(read_only=True)
    
    # Computed fields for better UX
    owner_name = serializers.CharField(source="owner.get_full_name", read_only=True)
    agent_name = serializers.CharField(source="agent.get_full_name", read_only=True)
    
    # Enhanced price display
    price_display = serializers.SerializerMethodField()
    
    class Meta:
        model = PropertyListing
        fields = [
            # Identifiers
            "id", "property_uid", 
            
            # Ownership & Agency
            "owner", "owner_name", "agent", "agent_name",
            
            # Listing Details
            "listing_type", "title", "slug", "short_description", "description",
            
            # Pricing
            "price", "price_display", "currency", "service_charge",
            
            # Specifications
            "bedrooms", "bathrooms", "toilets", "facilities",
            
            # Location
            "location", "address",
            
            # Status & Visibility
            "is_published", "ranking_score", "is_boosted", "boost_until", "expires_at",
            
            # Related Data
            "media", "units", "engagement",
            
            # Timestamps
            "created_at", "updated_at"
        ]
        read_only_fields = [
            "id", "property_uid", "slug", "ranking_score", 
            "is_boosted", "created_at", "updated_at"
        ]

    def get_price_display(self, obj):
        """Format price with currency for display"""
        return f"{obj.currency} {obj.price:,.2f}"

    def validate(self, data):
        """Custom validation for property listings"""
        # Ensure agent is not the same as owner
        if data.get('agent') and data.get('owner') == data.get('agent'):
            raise serializers.ValidationError({
                "agent": "Agent cannot be the same as the property owner."
            })
        
        # Validate price is positive
        if data.get('price', 0) <= 0:
            raise serializers.ValidationError({
                "price": "Price must be greater than zero."
            })
        
        return data


class PropertyListingCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating listings"""
    class Meta:
        model = PropertyListing
        fields = [
            "owner", "listing_type", "title", "short_description", "description",
            "price", "currency", "service_charge", "bedrooms", "bathrooms", 
            "toilets", "facilities", "location", "address"
        ]


class PropertyListingSummarySerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views"""
    owner_name = serializers.CharField(source="owner.get_full_name", read_only=True)
    media_count = serializers.SerializerMethodField()
    units_count = serializers.SerializerMethodField()
    cover_image = serializers.SerializerMethodField()
    
    class Meta:
        model = PropertyListing
        fields = [
            "id", "property_uid", "title", "listing_type", "price", "currency",
            "bedrooms", "bathrooms", "location", "address", "is_published",
            "is_boosted", "owner_name", "media_count", "units_count", 
            "cover_image", "created_at"
        ]
        read_only_fields = ["id", "property_uid", "created_at"]

    def get_media_count(self, obj):
        return obj.media.count()

    def get_units_count(self, obj):
        return obj.units.count()

    def get_cover_image(self, obj):
        cover_media = obj.media.filter(is_cover=True).first()
        if cover_media:
            return PropertyMediaSerializer(cover_media).data
        return None


class InspectionBookingSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source="tenant.get_full_name", read_only=True)
    listing_title = serializers.CharField(source="listing.title", read_only=True)
    unit_name = serializers.CharField(source="unit.name", read_only=True, allow_null=True)
    
    class Meta:
        model = InspectionBooking
        fields = [
            "id", "listing", "listing_title", "unit", "unit_name", 
            "tenant", "tenant_name", "scheduled_date", "status", 
            "notes", "created_at"
        ]
        read_only_fields = ["id", "created_at"]


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source="sender.get_full_name", read_only=True)
    
    class Meta:
        model = Message
        fields = ["id", "thread", "sender", "sender_name", "body", "created_at"]
        read_only_fields = ["id", "created_at"]


class MessageThreadSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    listing_title = serializers.CharField(source="listing.title", read_only=True)
    created_by_name = serializers.CharField(source="created_by.get_full_name", read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = MessageThread
        fields = [
            "id", "listing", "listing_title", "subject", "created_by", 
            "created_by_name", "participants", "messages", "last_message",
            "unread_count", "is_active", "created_at"
        ]
        read_only_fields = ["id", "created_at"]

    def get_last_message(self, obj):
        last_msg = obj.messages.order_by('-created_at').first()
        if last_msg:
            return MessageSerializer(last_msg).data
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.messages.exclude(read_by=request.user).count()
        return 0
