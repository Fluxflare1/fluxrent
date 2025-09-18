from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class UserAdminSerializer(serializers.ModelSerializer):
    """
    Serializer for admin-level user management.
    """

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "role",
            "is_active",
            "date_joined",
            "last_login",
        ]
        read_only_fields = ["id", "date_joined", "last_login"]
