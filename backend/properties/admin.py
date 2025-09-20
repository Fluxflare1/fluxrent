# backend/properties/admin.py
from django.contrib import admin
from .models import Property

@from django.contrib import admin
from .models import Property


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "address", "owner", "created_at")
    list_filter = ("created_at",)
    search_fields = ("name", "address", "owner__email")
    ordering = ("-created_at",)

# REMOVED: Apartment registration from here to avoid duplicate error
# Apartments are now only registered in apartments/admin.py



