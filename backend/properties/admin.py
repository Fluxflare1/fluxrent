# backend/properties/admin.py
from django.contrib import admin
from .models import Property

@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ("uid", "name", "owner", "state_code", "lga_code", "created_at")
    search_fields = ("uid", "name", "state_code", "lga_code", "owner__email")
    list_filter = ("state_code", "lga_code", "created_at")

# REMOVED: Apartment registration from here to avoid duplicate error
# Apartments are now only registered in apartments/admin.py
