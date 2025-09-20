from django.contrib import admin
from .models import Apartment
from tenants.models import TenantApartment


class TenantApartmentInline(admin.TabularInline):
    model = TenantApartment
    extra = 0
    fields = ("tenant", "bond_status", "requested_at", "activated_at")
    readonly_fields = ("requested_at",)


@admin.register(Apartment)
class ApartmentAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "property", "unit_number", "is_available", "created_at")
    list_filter = ("is_available", "created_at")
    search_fields = ("name", "unit_number", "property__name")
    ordering = ("-created_at",)
    inlines = [TenantApartmentInline]
