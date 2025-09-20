from django.contrib import admin
from .models import Apartment
from tenants.models import TenantApartment, BondRequest


class TenantApartmentInline(admin.TabularInline):
    model = TenantApartment
    fk_name = "apartment"
    extra = 0


class BondRequestInline(admin.TabularInline):
    model = BondRequest
    fk_name = "apartment"
    extra = 0


@admin.register(Apartment)
class ApartmentAdmin(admin.ModelAdmin):
    list_display = ("id", "property", "created_at")
    search_fields = ("property__name",)
    autocomplete_fields = ("property",)
    inlines = [TenantApartmentInline, BondRequestInline]
