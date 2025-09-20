from django.contrib import admin
from .models import TenantApartment, BondRequest
from bills.models import Bill
from payments.models import Payment


class PaymentInline(admin.TabularInline):
    model = Payment
    extra = 0
    fields = ("amount", "status", "payment_method", "created_at")
    readonly_fields = ("created_at",)


class BillInline(admin.TabularInline):
    model = Bill
    extra = 0
    fields = ("amount", "due_date", "status", "created_at")
    readonly_fields = ("created_at",)
    inlines = [PaymentInline]  # chain payments inline under bills


@admin.register(TenantApartment)
class TenantApartmentAdmin(admin.ModelAdmin):
    list_display = ("tenant", "apartment", "bond_status", "requested_at", "activated_at", "terminated_at")
    list_filter = ("bond_status", "requested_at")
    search_fields = ("tenant__email", "apartment__name")
    ordering = ("-requested_at",)
    inlines = [BillInline]


@admin.register(BondRequest)
class BondRequestAdmin(admin.ModelAdmin):
    list_display = ("tenant", "apartment", "status", "initiator", "created_at", "processed_at", "processed_by")
    list_filter = ("status", "created_at")
    search_fields = ("tenant__email", "apartment__name", "initiator__email")
    ordering = ("-created_at",)
