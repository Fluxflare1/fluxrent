from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("id", "bill", "amount", "status", "payment_method", "created_at")
    list_filter = ("status", "payment_method", "created_at")
    search_fields = ("bill__tenant_apartment__tenant__email", "bill__tenant_apartment__apartment__name")
    ordering = ("-created_at",)
