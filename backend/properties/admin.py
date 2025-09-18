# backend/properties/admin.py
from django.contrib import admin
from .models import Property

@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ("id", "uid", "name", "created_at")
    search_fields = ("uid", "name", "address")
