# backend/apartments/admin.py
from django.contrib import admin
from .models import Apartment


@admin.register(Apartment)
class ApartmentAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "property", "unit_number", "is_available", "created_at")
    list_filter = ("is_available", "created_at")
    search_fields = ("name", "unit_number", "property__name")
    ordering = ("-created_at",)

