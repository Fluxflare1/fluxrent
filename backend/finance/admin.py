# backend/finance/admin.py
from django.contrib import admin
from .models import FeeConfig, TransactionAudit, Dispute


@admin.register(FeeConfig)
class FeeConfigAdmin(admin.ModelAdmin):
    list_display = ("channel", "percent", "fixed", "active", "created_at")
    list_editable = ("percent", "fixed", "active")
    search_fields = ("channel",)


@admin.register(TransactionAudit)
class TransactionAuditAdmin(admin.ModelAdmin):
    list_display = ("uid", "channel", "gross_amount", "fee_amount", "net_amount", "status", "created_at")
    search_fields = ("uid", "reference", "wallet_transaction_id", "payment_record_id")
    list_filter = ("channel", "status", "currency")


@admin.register(Dispute)
class DisputeAdmin(admin.ModelAdmin):
    list_display = ("uid", "transaction", "raised_by", "status", "resolution", "created_at")
    readonly_fields = ("uid", "created_at", "updated_at")
    list_filter = ("status",)
    search_fields = ("uid", "raised_by__email", "transaction__uid")
