# backend/apartments/admin.py
from django.contrib import admin
from .models import Apartment

@admin.register(Apartment)
class ApartmentAdmin(admin.ModelAdmin):
    list_display = ("uid", "property", "number", "floor", "bedrooms", "is_occupied", "tenant")
    search_fields = ("uid", "number", "property__uid", "property__name")
    list_filter = ("is_occupied", "bedrooms", "floor", "created_at")
