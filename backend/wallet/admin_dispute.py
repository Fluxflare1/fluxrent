# backend/wallet/admin_dispute.py
from django.contrib import admin
from .models_dispute import Dispute, DisputeComment

@admin.register(Dispute)
class DisputeAdmin(admin.ModelAdmin):
    list_display = ("uid", "raised_by", "amount", "status", "created_at", "resolved_at", "resolved_by")
    search_fields = ("uid", "raised_by__email", "payment_reference", "wallet_transaction__uid")
    list_filter = ("status",)
    readonly_fields = ("uid", "created_at", "updated_at", "resolved_at")
    ordering = ("-created_at",)
    fields = (
        "uid",
        "raised_by",
        "wallet_transaction",
        "payment_reference",
        "amount",
        "reason",
        "evidence",
        "status",
        "resolution_note",
        "resolved_by",
        "resolved_at",
        "created_at",
        "updated_at",
    )

@admin.register(DisputeComment)
class DisputeCommentAdmin(admin.ModelAdmin):
    list_display = ("dispute", "author", "internal", "created_at")
    list_filter = ("internal",)
    search_fields = ("author__email", "comment")
