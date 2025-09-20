from django.contrib import admin
from .models import Apartment
from tenants.models import TenantApartment, BondRequest


class TenantApartmentInline(admin.TabularInline):
    model = TenantApartment
    extra = 0
    autocomplete_fields = ["tenant"]


class BondRequestInline(admin.TabularInline):
    model = BondRequest
    extra = 0
    autocomplete_fields = ["tenant"]


@admin.register(Apartment)
class ApartmentAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "property", "created_at"]
    search_fields = ["name"]
    list_filter = ["created_at"]
    autocomplete_fields = ["property"]
    inlines = [TenantApartmentInline, BondRequestInline]
