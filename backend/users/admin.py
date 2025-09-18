# backend/users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    model = User
    list_display = ("id", "uid", "username", "email", "role", "is_active", "date_joined")
    list_filter = ("role", "is_active")
    search_fields = ("username", "email", "uid")
    fieldsets = (
        (None, {"fields": ("username", "password")}),
        ("Personal", {"fields": ("first_name", "last_name", "email", "phone")}),
        ("Account", {"fields": ("role", "uid", "dva", "is_active", "is_staff")}),
        ("Permissions", {"fields": ("groups", "user_permissions")}),
    )
