# backend/bills/tests.py
from django.test import TestCase
from django.contrib.auth import get_user_model
from properties.models import Property, Apartment
from tenants.models import TenantApartment
from .models import BillType, Bill, Invoice, InvoiceLine, Payment

User = get_user_model()

class BillsSmokeTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="u1", email="u1@example.com", password="pass1234")
        self.prop = Property.objects.create(name="P1", state_code="01", lga_code="01", uid="PRP/01/01/00001")
        self.ap = Apartment.objects.create(uid="PRP/01/01/00001/APTMT/0001", property=self.prop, number="A1")
        # tenant bond (TenantApartment expected)
        self.tenant_ap = TenantApartment.objects.create(tenant=self.user, apartment=self.ap)
        self.bt = BillType.objects.create(name="Rent", description="Monthly rent", is_recurring=True, default_amount=1000)
    def test_create_bill_and_invoice(self):
        bill = Bill.objects.create(apartment=self.ap, bill_type=self.bt, amount=1500)
        invoice = Invoice.objects.create(tenant_apartment=self.tenant_ap, invoice_no=f"INV/{2025}/000001")
        InvoiceLine.objects.create(invoice=invoice, bill=bill, description="Rent for Sep", amount=1500)
        invoice.recalc_totals()
        self.assertEqual(invoice.total_amount, 1500)
