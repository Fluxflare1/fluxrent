# backend/rents/admin.py
from django.contrib import admin
from .models import Tenancy, LateFeeRule, RentInvoice, RentPayment, Receipt

@admin.register(Tenancy)
class TenancyAdmin(admin.ModelAdmin):
    list_display = ("uid", "tenant", "apartment", "monthly_rent", "is_active", "created_at")
    search_fields = ("uid", "tenant__email", "apartment__name")

@admin.register(LateFeeRule)
class LateFeeRuleAdmin(admin.ModelAdmin):
    list_display = ("property", "enabled", "percentage", "fixed_amount", "grace_days")

@admin.register(RentInvoice)
class RentInvoiceAdmin(admin.ModelAdmin):
    list_display = ("uid", "tenancy", "amount", "outstanding", "due_date", "status")
    list_filter = ("status", )

@admin.register(RentPayment)
class RentPaymentAdmin(admin.ModelAdmin):
    list_display = ("uid", "invoice", "payer", "amount", "method", "status", "created_at")
    search_fields = ("uid", "reference")

@admin.register(Receipt)
class ReceiptAdmin(admin.ModelAdmin):
    list_display = ("uid", "payment", "issued_at")
