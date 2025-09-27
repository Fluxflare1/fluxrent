# backend/disputes/admin.py
from django.contrib import admin
from .models import Dispute, DisputeAuditTrail

@admin.register(Dispute)
class DisputeAdmin(admin.ModelAdmin):
    list_display = ("uid", "user", "transaction_reference", "amount", "status", "created_at")
    search_fields = ("uid", "user__email", "transaction_reference")
    list_filter = ("status",)
    readonly_fields = ("uid", "created_at", "updated_at",)

@admin.register(DisputeAuditTrail)
class DisputeAuditAdmin(admin.ModelAdmin):
    list_display = ("dispute", "actor", "action", "timestamp")
    search_fields = ("dispute__uid", "actor__email", "action")
