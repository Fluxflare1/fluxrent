from django.contrib import admin
from .models import Apartment

@admin.register(Apartment)
class ApartmentAdmin(admin.ModelAdmin):
    list_display = ("id", "property", "unit_number", "rent", "status")  # fixed
    search_fields = ("unit_number",)
