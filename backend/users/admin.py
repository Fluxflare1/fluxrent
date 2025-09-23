from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, KYC


class UserAdmin(BaseUserAdmin):
    ordering = ["email"]
    list_display = ["email", "first_name", "last_name", "role", "kyc_completed", "is_staff"]
    search_fields = ["email", "first_name", "last_name", "phone_number"]
    fieldsets = (
        (None, {"fields": ("email", "password", "uid")}),
        ("Personal Info", {"fields": ("first_name", "last_name", "phone_number")}),
        ("Role & KYC", {"fields": ("role", "kyc_completed")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "first_name", "last_name", "phone_number", "password1", "password2", "role"),
        }),
    )


admin.site.register(User, UserAdmin)
admin.site.register(KYC)
