from django.contrib import admin
from django.contrib.auth import get_user_model
from tenants.models import TenantApartment, BondRequest

User = get_user_model()


class TenantApartmentInline(admin.TabularInline):
    model = TenantApartment
    fk_name = "tenant"
    extra = 0


class BondRequestInline(admin.TabularInline):
    model = BondRequest
    fk_name = "tenant"
    extra = 0


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "username", "email", "is_active", "is_staff")
    search_fields = ("username", "email")  # REQUIRED for autocomplete_fields
    inlines = [TenantApartmentInline, BondRequestInline]
