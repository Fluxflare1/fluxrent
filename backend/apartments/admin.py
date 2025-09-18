from django.contrib import admin
from .models import Apartment

@admin.register(Apartment)
class ApartmentAdmin(admin.ModelAdmin):
    list_display = ("id", "uid", "property", "number", "rent_amount")
    search_fields = ("uid", "number")
