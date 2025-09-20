from django.contrib import admin
from django.contrib.auth import get_user_model
from django.template.response import TemplateResponse

# from tenants.models import Tenant   # 🚨 disable this until Tenant exists
from billing.models import Invoice, Payment


class CustomAdminSite(admin.AdminSite):
    site_header = "FluxRent Administration"
    site_title = "FluxRent Admin"
    index_title = "Dashboard"

    def index(self, request, extra_context=None):
        User = get_user_model()

        stats = {
            # "tenants": Tenant.objects.count(),  # 🚨 disable for now
            "users": User.objects.count(),
            "invoices": Invoice.objects.count(),
            "payments": Payment.objects.count(),
        }

        context = {
            **self.each_context(request),
            "title": self.index_title,
            "apps": self.get_app_list(request),
            "stats": stats,
        }

        return TemplateResponse(request, "admin/custom_index.html", context)
