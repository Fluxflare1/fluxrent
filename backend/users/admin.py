from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UIDSequence

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("email", "first_name", "last_name", "role", "status", "uid", "is_staff")
    search_fields = ("email", "first_name", "last_name", "uid")
    ordering = ("email",)
    readonly_fields = ("date_joined",)

@admin.register(UIDSequence)
class UIDSequenceAdmin(admin.ModelAdmin):
    list_display = ("entity_type", "state_code", "lga_code", "seq")
