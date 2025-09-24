# backend/payments/admin.py
from django.contrib import admin
from .models import PaymentRecord, Prepayment, PaymentAllocation

@admin.register(PaymentRecord)
class PaymentRecordAdmin(admin.ModelAdmin):
    list_display = ("uid", "invoice", "tenant", "amount", "method", "status", "created_at")
    search_fields = ("uid", "invoice__uid", "tenant__email", "reference")
    list_filter = ("method", "status", "created_at")
    readonly_fields = ("uid", "created_at",)


@admin.register(Prepayment)
class PrepaymentAdmin(admin.ModelAdmin):
    list_display = ("uid", "tenant", "amount", "remaining", "reference", "created_at", "is_active")
    search_fields = ("uid", "tenant__email", "reference")
    list_filter = ("is_active", "created_at")


@admin.register(PaymentAllocation)
class PaymentAllocationAdmin(admin.ModelAdmin):
    list_display = ("uid", "prepayment", "invoice", "amount", "allocated_at")
    search_fields = ("uid", "prepayment__uid", "invoice__uid")
    list_filter = ("allocated_at",)
