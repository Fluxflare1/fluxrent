from django.contrib import admin
from django.contrib.auth import get_user_model
from tenants.models import TenantApartment, BondRequest

User = get_user_model()


class TenantApartmentInline(admin.TabularInline):
    model = TenantApartment
    extra = 0
    autocomplete_fields = ["apartment"]


class BondRequestInline(admin.TabularInline):
    model = BondRequest
    extra = 0
    autocomplete_fields = ["apartment"]


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ["id", "username", "email", "is_active", "is_staff", "date_joined"]
    list_filter = ["is_active", "is_staff", "date_joined"]
    search_fields = ["username", "email"]
    inlines = [TenantApartmentInline, BondRequestInline]
