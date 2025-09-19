from django.contrib import admin
from .models import Wallet, WalletTransaction, SavingsPlan


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "balance", "currency", "status", "created_at")
    search_fields = ("user__username", "user__email")


@admin.register(WalletTransaction)
class WalletTransactionAdmin(admin.ModelAdmin):
    list_display = ("id", "wallet", "amount", "type", "source", "status", "created_at")
    search_fields = ("wallet__user__username", "reference")
    list_filter = ("type", "status", "source")


@admin.register(SavingsPlan)
class SavingsPlanAdmin(admin.ModelAdmin):
    list_display = ("id", "wallet", "target_amount", "current_balance", "interval", "status")
    list_filter = ("status", "interval")
    search_fields = ("wallet__user__username",)
