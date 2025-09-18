from django.contrib import admin
from .models import Bill

@admin.register(Bill)
class BillAdmin(admin.ModelAdmin):
    list_display = ("id", "apartment", "amount", "paid", "issued_at")
    list_filter = ("paid",)
