from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id","email","username","first_name","last_name","phone","role","status","uid","dva_id","date_joined")

class SignupSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=[("tenant","tenant"),("property_admin","property_admin"),("agent","agent")], default="tenant")

class ApproveSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    approve = serializers.BooleanField()
    role = serializers.CharField(required=False)
