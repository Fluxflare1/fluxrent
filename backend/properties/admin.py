# backend/properties/admin.py
from django.contrib import admin
from .models import Property
from apartments.models import Apartment


class ApartmentInline(admin.TabularInline):
    model = Apartment
    extra = 0
    fields = ("name", "unit_number", "is_available", "created_at")
    readonly_fields = ("created_at",)


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "address", "owner", "created_at")
    list_filter = ("created_at",)
    search_fields = ("name", "address", "owner__email")
    ordering = ("-created_at",)
    inlines = [ApartmentInline]
