from django.contrib.admin import AdminSite as BaseAdminSite
from django.template.response import TemplateResponse
from django.contrib.auth import get_user_model
from properties.models import Property
from bills.models import Invoice, Payment

Tenant = get_user_model()

class AdminSite(BaseAdminSite):
    site_header = "FluxRent Admin"
    site_title = "FluxRent Portal"
    index_title = "Dashboard"

    def index(self, request, extra_context=None):
        context = {
            "tenant_count": Tenant.objects.count(),
            "property_count": Property.objects.count(),
            "lease_count": Lease.objects.count(),
            "invoice_count": Invoice.objects.count(),
            "payment_count": Payment.objects.count(),
        }
        if extra_context:
            context.update(extra_context)
        return super().index(request, extra_context=context)


admin_site = AdminSite(name="admin")
