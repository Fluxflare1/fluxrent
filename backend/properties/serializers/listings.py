from rest_framework import serializers
from properties.models.listings import (
    PropertyListing,
    ListingPhoto,
    InspectionBooking,
    SearchOptimization,
)
from properties.models.engagement import ListingEngagement


class ListingPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingPhoto
        fields = ["id", "image", "caption", "is_cover"]
        read_only_fields = ["id"]


class SearchOptimizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SearchOptimization
        fields = ["id", "listing", "is_featured", "boost_score", "updated_at"]
        read_only_fields = ["id", "listing", "updated_at"]


class InspectionBookingSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source="tenant.get_full_name", read_only=True)
    tenant_email = serializers.CharField(source="tenant.email", read_only=True)
    listing_title = serializers.CharField(source="listing.title", read_only=True)

    class Meta:
        model = InspectionBooking
        fields = [
            "id",
            "listing",
            "listing_title",
            "tenant",
            "tenant_name",
            "tenant_email",
            "status",
            "scheduled_date",
            "notes",
            "created_at",
        ]
        read_only_fields = ["id", "status", "created_at", "tenant_name", "tenant_email", "listing_title"]


class PropertyListingSerializer(serializers.ModelSerializer):
    # Related fields
    photos = ListingPhotoSerializer(many=True, read_only=True)
    
    # Computed fields from related models
    optimization = serializers.SerializerMethodField()
    engagement = serializers.SerializerMethodField()
    
    # Read-only informative fields
    owner_name = serializers.CharField(source="owner.get_full_name", read_only=True)
    agent_name = serializers.CharField(source="agent.get_full_name", read_only=True)

    class Meta:
        model = PropertyListing
        fields = [
            # Core identifiers
            "id",
            "property_uid",
            
            # Ownership/management
            "owner",
            "owner_name",
            "agent", 
            "agent_name",
            
            # Listing details
            "listing_type",
            "title",
            "slug",
            "description",
            
            # Pricing
            "price",
            "service_charge",
            
            # Property specs
            "bedrooms",
            "bathrooms", 
            "toilets",
            "facilities",
            "location",
            
            # Status & visibility
            "is_published",
            "ranking_score",
            
            # Related data
            "photos",
            "optimization", 
            "engagement",
            
            # Timestamps
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "property_uid", 
            "slug", 
            "ranking_score",
            "owner_name",
            "agent_name",
            "created_at",
            "updated_at"
        ]

    def get_optimization(self, obj):
        """Get search optimization data if it exists"""
        if hasattr(obj, "optimization"):
            return {
                "is_featured": obj.optimization.is_featured,
                "boost_score": obj.optimization.boost_score,
            }
        return {"is_featured": False, "boost_score": 0}

    def get_engagement(self, obj):
        """Get engagement metrics if they exist"""
        if hasattr(obj, "engagement"):
            return {
                "views": obj.engagement.views,
                "inspections": obj.engagement.inspections,
                "inquiries": obj.engagement.inquiries,
            }
        return {"views": 0, "inspections": 0, "inquiries": 0}

    def validate_price(self, value):
        """Ensure price is positive"""
        if value <= 0:
            raise serializers.ValidationError("Price must be positive.")
        return value

    def validate_bedrooms(self, value):
        """Ensure bedrooms count is reasonable"""
        if value < 0 or value > 50:
            raise serializers.ValidationError("Number of bedrooms must be between 0 and 50.")
        return value
