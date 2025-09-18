# backend/properties/admin.py
from django.contrib import admin
from .models import Property, Apartment

@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ("uid", "name", "owner", "state_code", "lga_code", "created_at")
    search_fields = ("uid", "name", "address", "owner__email")
    readonly_fields = ("uid", "created_at", "updated_at")
    raw_id_fields = ("owner",)

@admin.register(Apartment)
class ApartmentAdmin(admin.ModelAdmin):
    list_display = ("uid", "property", "number", "floor", "bedrooms", "rent_amount", "is_occupied")
    search_fields = ("uid", "number", "property__uid", "property__name")
    readonly_fields = ("uid", "created_at", "updated_at")
    raw_id_fields = ("property", "tenant")
