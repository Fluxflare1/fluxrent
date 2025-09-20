from django.contrib import admin
from .models import Property
from apartments.models import Apartment


class ApartmentInline(admin.TabularInline):
    model = Apartment
    extra = 0


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "location", "owner", "created_at"]
    search_fields = ["name", "location"]
    list_filter = ["created_at"]
    inlines = [ApartmentInline]
