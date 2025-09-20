from django.contrib import admin
from .models import Invoice
from payments.models import PaymentRecord


class PaymentRecordInline(admin.TabularInline):
    model = PaymentRecord
    extra = 0
    autocomplete_fields = ["tenant", "confirmed_by"]


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ["id", "tenant_apartment", "amount", "status", "due_date", "created_at"]
    list_filter = ["status", "due_date"]
    search_fields = ["tenant_apartment__tenant__username", "tenant_apartment__apartment__name"]
    autocomplete_fields = ["tenant_apartment"]
    inlines = [PaymentRecordInline]
