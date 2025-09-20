from django.contrib import admin
from .models import Invoice
from payments.models import PaymentRecord

class PaymentRecordInline(admin.TabularInline):
    model = PaymentRecord
    extra = 0

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ("id", "tenant", "total_amount", "status", "due_date", "created_at")  # fixed
    list_filter = ("status",)
    inlines = [PaymentRecordInline]
