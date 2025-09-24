# backend/payments/admin.py
from django.contrib import admin
from .models import PaymentRecord

@admin.register(PaymentRecord)
class PaymentRecordAdmin(admin.ModelAdmin):
    list_display = ("uid", "invoice", "tenant", "amount", "method", "status", "created_at")
    search_fields = ("uid", "invoice__uid", "tenant__email", "reference")
    list_filter = ("method", "status", "created_at")
    readonly_fields = ("uid", "created_at",)
