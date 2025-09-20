# backend/tenants/admin.py
from django.contrib import admin
from .models import TenantApartment, BondRequest


@admin.register(TenantApartment)
class TenantApartmentAdmin(admin.ModelAdmin):
    list_display = ("tenant", "apartment", "bond_status", "requested_at", "activated_at", "terminated_at")
    list_filter = ("bond_status", "requested_at")
    search_fields = ("tenant__email", "apartment__name")
    ordering = ("-requested_at",)


@admin.register(BondRequest)
class BondRequestAdmin(admin.ModelAdmin):
    list_display = ("tenant", "apartment", "status", "initiator", "created_at", "processed_at", "processed_by")
    list_filter = ("status", "created_at")
    search_fields = ("tenant__email", "apartment__name", "initiator__email")
    ordering = ("-created_at",)
