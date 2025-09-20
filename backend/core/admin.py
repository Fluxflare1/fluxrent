from django.contrib import admin
from django.urls import path
from django.template.response import TemplateResponse

# Import models to display in dashboard
from django.contrib.auth import get_user_model
from properties.models import Property
from apartments.models import Apartment
from tenants.models import TenantApartment, BondRequest
from bills.models import Invoice
from wallets.models import Wallet
from payments.models import PaymentRecord

User = get_user_model()


class CustomAdminSite(admin.AdminSite):
    site_header = "X-Ride Platform Administration"
    site_title = "X-Ride Admin"
    index_title = "Dashboard"

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path("", self.admin_view(self.dashboard), name="index"),
        ]
        return custom_urls + urls

    def dashboard(self, request):
        context = dict(
            self.each_context(request),
            title="Admin Dashboard",
            user_count=User.objects.count(),
            property_count=Property.objects.count(),
            apartment_count=Apartment.objects.count(),
            tenant_count=TenantApartment.objects.count(),
            bond_request_count=BondRequest.objects.count(),
            invoice_count=Invoice.objects.count(),
            payment_count=PaymentRecord.objects.count(),
            wallet_count=Wallet.objects.count(),
        )
        return TemplateResponse(request, "admin/custom_index.html", context)


# Instantiate custom site
custom_admin_site = CustomAdminSite(name="custom_admin")

# Register models
custom_admin_site.register(User)
custom_admin_site.register(Property)
custom_admin_site.register(Apartment)
custom_admin_site.register(TenantApartment)
custom_admin_site.register(BondRequest)
custom_admin_site.register(Invoice)
custom_admin_site.register(PaymentRecord)
custom_admin_site.register(Wallet)
