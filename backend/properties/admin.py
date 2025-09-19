# backend/properties/admin.py
from django.contrib import admin
from .models import Property
from apartments.models import Apartment

@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ("uid", "name", "owner", "state_code", "lga_code", "created_at")
    search_fields = ("uid", "name", "state_code", "lga_code", "owner__email")
    list_filter = ("state_code", "lga_code", "created_at")


@admin.register(Apartment)
class ApartmentAdmin(admin.ModelAdmin):
    list_display = ("uid", "property", "number", "floor", "bedrooms", "is_occupied")
    search_fields = ("uid", "number", "property__uid", "property__name")
    list_filter = ("property", "bedrooms", "is_occupied")
