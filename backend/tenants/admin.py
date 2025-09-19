# backend/tenants/admin.py
from django.contrib import admin
from .models import TenantApartment, BondRequest

@admin.register(TenantApartment)
class TenantApartmentAdmin(admin.ModelAdmin):
    list_display = ("id", "tenant", "apartment", "bond_status", "initiated_by", "requested_at", "activated_at", "terminated_at")
    list_filter = ("bond_status",)
    search_fields = ("tenant__email", "apartment__uid", "apartment__number")

@admin.register(BondRequest)
class BondRequestAdmin(admin.ModelAdmin):
    list_display = ("id", "tenant", "apartment", "status", "initiator", "created_at", "processed_at", "processed_by")
    list_filter = ("status",)
    search_fields = ("tenant__email", "apartment__uid", "initiator__email")
