from django.contrib import admin
from django.contrib.auth import get_user_model
from tenants.models import TenantApartment
from bills.models import Bill
from payments.models import Payment


class PaymentInline(admin.TabularInline):
    model = Payment
    extra = 0
    fields = ("amount", "status", "payment_method", "created_at")
    readonly_fields = ("created_at",)


class BillInline(admin.TabularInline):
    model = Bill
    extra = 0
    fields = ("amount", "due_date", "status", "created_at")
    readonly_fields = ("created_at",)
    inlines = [PaymentInline]


class TenantApartmentInline(admin.TabularInline):
    model = TenantApartment
    extra = 0
    fields = ("apartment", "bond_status", "requested_at", "activated_at")
    readonly_fields = ("requested_at",)
    inlines = [BillInline]


User = get_user_model()


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "email", "first_name", "last_name", "is_active", "is_staff", "date_joined")
    list_filter = ("is_active", "is_staff", "is_superuser")
    search_fields = ("email", "first_name", "last_name")
    ordering = ("-date_joined",)
    inlines = [TenantApartmentInline]
