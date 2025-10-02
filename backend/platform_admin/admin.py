from django.contrib import admin
from .models import AuditLog, BroadcastTemplate, PlatformSetting

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("created_at", "actor", "action", "object_repr")
    readonly_fields = ("created_at",)


@admin.register(BroadcastTemplate)
class BroadcastTemplateAdmin(admin.ModelAdmin):
    list_display = ("name", "is_active", "created_by", "created_at")


@admin.register(PlatformSetting)
class PlatformSettingAdmin(admin.ModelAdmin):
    list_display = ("key", "updated_at")
