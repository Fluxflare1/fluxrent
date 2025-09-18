# backend/users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from django.utils.translation import gettext_lazy as _
from django import forms
from .models import User

class CustomUserChangeForm(forms.ModelForm):
    class Meta:
        model = User
        fields = "__all__"

@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    form = CustomUserChangeForm
    list_display = ("email", "first_name", "last_name", "role", "is_staff", "is_active")
    list_filter = ("role", "is_staff", "is_superuser", "is_active")
    search_fields = ("email", "first_name", "last_name")
    ordering = ("email",)
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (_("Personal info"), {"fields": ("first_name", "last_name","phone")}),
        (_("Permissions"), {"fields": ("is_active", "is_staff", "is_superuser", "role")}),
        (_("UID & DVA"), {"fields": ("uid", "dva")}),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
    )
