from django.contrib import admin
from .models import Wallet, WalletTransaction


class WalletTransactionInline(admin.TabularInline):
    model = WalletTransaction
    extra = 0
    fields = ("amount", "transaction_type", "status", "created_at")
    readonly_fields = ("created_at",)


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "balance", "currency", "created_at")
    list_filter = ("currency", "created_at")
    search_fields = ("user__email",)
    ordering = ("-created_at",)
    inlines = [WalletTransactionInline]


@admin.register(WalletTransaction)
class WalletTransactionAdmin(admin.ModelAdmin):
    list_display = ("id", "wallet", "amount", "transaction_type", "status", "created_at")
    list_filter = ("transaction_type", "status", "created_at")
    search_fields = ("wallet__user__email",)
    ordering = ("-created_at",)
