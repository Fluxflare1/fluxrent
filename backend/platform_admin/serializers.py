from rest_framework import serializers
from .models import AuditLog, BroadcastTemplate, PlatformSetting

class AuditLogSerializer(serializers.ModelSerializer):
    actor = serializers.StringRelatedField()
    class Meta:
        model = AuditLog
        fields = ["id", "actor", "action", "object_repr", "data", "ip_address", "created_at"]


class BroadcastTemplateSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = BroadcastTemplate
        fields = ["id", "name", "subject", "body", "is_active", "created_by", "created_at"]


class PlatformSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformSetting
        fields = ["id", "key", "value", "description", "updated_at"]
