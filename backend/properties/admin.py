from django.contrib import admin
from .models import Property

@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "address", "city")  # replaced 'location'
    search_fields = ("name", "address", "city")
