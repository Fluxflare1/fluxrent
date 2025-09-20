from django.contrib import admin
from .models import Bill
from payments.models import Payment


class PaymentInline(admin.TabularInline):
    model = Payment
    extra = 0
    fields = ("amount", "status", "payment_method", "created_at")
    readonly_fields = ("created_at",)


@admin.register(Bill)
class BillAdmin(admin.ModelAdmin):
    list_display = ("id", "tenant_apartment", "amount", "due_date", "status", "created_at")
    list_filter = ("status", "due_date")
    search_fields = ("tenant_apartment__tenant__email", "tenant_apartment__apartment__name")
    ordering = ("-created_at",)
    inlines = [PaymentInline]
