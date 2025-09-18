# backend/properties/admin.py
from django.contrib import admin
from .models import Property

@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ("uid", "name", "state_code", "lga_code", "owner", "created_at")
    search_fields = ("uid", "name", "state_code", "lga_code")
    list_filter = ("state_code", "lga_code", "created_at")
