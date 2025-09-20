# backend/bills/admin.py
from django.contrib import admin
from .models import BillType, Bill, Invoice, InvoiceLine, Payment, InvoiceSeq

@admin.register(BillType)
class BillTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "is_recurring", "default_amount")
    search_fields = ("name",)

@admin.register(Bill)
class BillAdmin(admin.ModelAdmin):
    list_display = ("id", "apartment", "bill_type", "amount", "is_active", "start_date", "end_date")
    list_filter = ("is_active", "bill_type")
    search_fields = ("apartment__uid", "bill_type__name")

class InvoiceLineInline(admin.TabularInline):
    model = InvoiceLine
    extra = 0

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ("invoice_no", "tenant_apartment", "issue_date", "due_date", "status", "total_amount", "paid_amount")
    search_fields = ("invoice_no", "tenant_apartment__id")
    inlines = [InvoiceLineInline]

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("payment_ref", "invoice", "amount", "status", "paid_at", "created_at")
    search_fields = ("payment_ref", "invoice__invoice_no")

@admin.register(InvoiceSeq)
class InvoiceSeqAdmin(admin.ModelAdmin):
    list_display = ("id", "created_at")

