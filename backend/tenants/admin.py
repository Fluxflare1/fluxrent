from django.contrib import admin
from .models import TenantApartment, BondRequest, StatementOfStay


@admin.register(TenantApartment)
class TenantApartmentAdmin(admin.ModelAdmin):
    list_display = ("id", "tenant", "apartment", "bond_status", "activated_at", "terminated_at")
    list_filter = ("bond_status",)
    search_fields = ("tenant__email", "apartment__uid", "apartment__number")
    readonly_fields = ("requested_at", "activated_at", "terminated_at")


@admin.register(BondRequest)
class BondRequestAdmin(admin.ModelAdmin):
    list_display = ("id", "tenant", "apartment", "status", "created_at", "processed_at", "processed_by")
    list_filter = ("status",)
    search_fields = ("tenant__email", "apartment__uid")
    actions = ["approve_requests", "reject_requests"]

    def approve_requests(self, request, queryset):
        for obj in queryset:
            obj.approve(actor=request.user)
        self.message_user(request, f"Approved {queryset.count()} bond requests.")
    approve_requests.short_description = "Approve selected bond requests"

    def reject_requests(self, request, queryset):
        for obj in queryset:
            obj.reject(actor=request.user)
        self.message_user(request, f"Rejected {queryset.count()} bond requests.")
    reject_requests.short_description = "Reject selected bond requests"


@admin.register(StatementOfStay)
class StatementOfStayAdmin(admin.ModelAdmin):
    list_display = ("id", "tenant_apartment", "generated_at", "total_billed", "total_paid", "balance")
    readonly_fields = ("generated_at",)
    search_fields = ("tenant_apartment__tenant__email", "tenant_apartment__apartment__uid")
