# backend/properties/serializers/boosting.py
from rest_framework import serializers
from properties.models.boost import BoostPackage, BoostPurchase, PlatformSetting
from properties.models.listings import PropertyListing

class BoostPackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = BoostPackage
        fields = ["id", "uid", "name", "duration_days", "price", "active"]

class BoostPurchaseCreateSerializer(serializers.Serializer):
    listing_id = serializers.UUIDField()
    package_id = serializers.IntegerField()
    method = serializers.ChoiceField(choices=["wallet", "external"])
    reference = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    def validate(self, data):
        try:
            listing = PropertyListing.objects.get(pk=data["listing_id"])
        except PropertyListing.DoesNotExist:
            raise serializers.ValidationError("Listing not found")
        data["listing_obj"] = listing
        try:
            pkg = BoostPackage.objects.get(pk=data["package_id"], active=True)
        except BoostPackage.DoesNotExist:
            raise serializers.ValidationError("Boost package not found")
        data["package_obj"] = pkg
        return data

class BoostPurchaseSerializer(serializers.ModelSerializer):
    listing = serializers.PrimaryKeyRelatedField(queryset=PropertyListing.objects.all())
    package = serializers.PrimaryKeyRelatedField(queryset=BoostPackage.objects.all())
    buyer = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = BoostPurchase
        fields = [
            "id", "uid", "listing", "buyer", "package", "amount", "reference", "status",
            "purchased_at", "starts_at", "ends_at"
        ]
        read_only_fields = ["uid", "buyer", "status", "purchased_at", "starts_at", "ends_at"]
