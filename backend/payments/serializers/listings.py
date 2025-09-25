from rest_framework import serializers
from .models.listings import (
    PropertyListing,
    ListingPhoto,
    InspectionBooking,
    SearchOptimization,
)


class ListingPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingPhoto
        fields = ["id", "image", "caption", "is_cover"]


class PropertyListingSerializer(serializers.ModelSerializer):
    photos = ListingPhotoSerializer(many=True, read_only=True)
    optimization = serializers.SerializerMethodField()

    class Meta:
        model = PropertyListing
        fields = [
            "id",
            "property_uid",
            "owner",
            "agent",
            "listing_type",
            "title",
            "slug",
            "description",
            "price",
            "service_charge",
            "bedrooms",
            "bathrooms",
            "toilets",
            "facilities",
            "location",
            "is_published",
            "ranking_score",
            "photos",
            "optimization",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["property_uid", "slug", "ranking_score"]

    def get_optimization(self, obj):
        if hasattr(obj, "optimization"):
            return {
                "is_featured": obj.optimization.is_featured,
                "boost_score": obj.optimization.boost_score,
            }
        return None


class InspectionBookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = InspectionBooking
        fields = [
            "id",
            "listing",
            "tenant",
            "status",
            "scheduled_date",
            "notes",
            "created_at",
        ]
        read_only_fields = ["status", "created_at"]


class SearchOptimizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SearchOptimization
        fields = ["id", "listing", "is_featured", "boost_score", "updated_at"]
