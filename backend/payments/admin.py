from django.contrib import admin
from .models import PaymentRecord

@admin.register(PaymentRecord)
class PaymentRecordAdmin(admin.ModelAdmin):
    list_display = ['id', 'invoice', 'tenant', 'method', 'amount', 'status', 'created_at']
    list_filter = ['method', 'status', 'created_at']
    search_fields = ['invoice__invoice_no', 'tenant__email', 'reference']
    ordering = ("-created_at",)

