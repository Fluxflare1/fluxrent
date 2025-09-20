from django.contrib.admin import AdminSite
from django.template.response import TemplateResponse
from django.urls import path
from django.utils.translation import gettext_lazy as _

class CustomAdminSite(AdminSite):
    site_header = "FluxRent Admin"
    site_title = "FluxRent Portal"
    index_title = "Welcome to FluxRent Dashboard"

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path("", self.admin_view(self.index), name="index"),
        ]
        return custom_urls + urls

    def index(self, request, extra_context=None):
        context = {
            "tenant_count": 0,
            "property_count": 0,
            "lease_count": 0,
            "invoice_count": 0,
            "payment_count": 0,
        }
        if extra_context:
            context.update(extra_context)
        return TemplateResponse(request, "admin/custom_index.html", context)

# ✅ Export this instance so urls.py can import it
custom_admin_site = CustomAdminSite(name="custom_admin")
