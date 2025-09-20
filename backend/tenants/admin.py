from django.contrib import admin
from .models import TenantApartment, BondRequest
from bills.models import Invoice


class InvoiceInline(admin.TabularInline):
    model = Invoice
    extra = 0


@admin.register(TenantApartment)
class TenantApartmentAdmin(admin.ModelAdmin):
    list_display = ("id", "tenant", "apartment", "bond_status", "requested_at")
    search_fields = ("tenant__username", "apartment__id")
    autocomplete_fields = ("tenant", "apartment", "initiated_by")
    inlines = [InvoiceInline]


@admin.register(BondRequest)
class BondRequestAdmin(admin.ModelAdmin):
    list_display = ("id", "tenant", "apartment", "status", "created_at")
    search_fields = ("tenant__username", "apartment__id")
    autocomplete_fields = ("tenant", "apartment", "initiator", "processed_by")
