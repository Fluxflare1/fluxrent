from rest_framework import serializers
from core.models.apartment import Apartment

class ApartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Apartment
        fields = "__all__"
