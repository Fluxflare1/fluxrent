from django.contrib.admin import AdminSite
from django.template.response import TemplateResponse
from tenants.models import Tenant
from properties.models import Property
from leases.models import Lease
from bills.models import Invoice, Payment

class AdminSite(AdminSite):
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
