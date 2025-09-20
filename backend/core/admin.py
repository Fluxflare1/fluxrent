from django.contrib import admin
from django.urls import reverse
from django.utils.html import format_html
from django.template.response import TemplateResponse


class CustomAdminSite(admin.AdminSite):
    site_header = "FluxRent Admin"
    site_title = "FluxRent Admin Portal"
    index_title = "Welcome to FluxRent Dashboard"

    def index(self, request, extra_context=None):
        # Add custom context for dashboard cards
        context = {
            **self.each_context(request),
            "title": self.index_title,
            "apps": self.get_app_list(request),
        }
        return TemplateResponse(request, "admin/custom_index.html", context)


custom_admin_site = CustomAdminSite(name="custom_admin")
