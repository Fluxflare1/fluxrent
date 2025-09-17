from rest_framework import serializers
from core.models.utility import Utility

class UtilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Utility
        fields = "__all__"
