from django.contrib import admin
from .models import Wallet


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ["id", "owner", "balance", "currency", "updated_at"]
    list_filter = ["currency", "updated_at"]
    search_fields = ["owner__username"]
    autocomplete_fields = ["owner"]
