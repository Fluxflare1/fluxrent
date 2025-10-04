Here’s the README.md for the Bills module (backend + frontend + integrations). No tables, just structured sections.


---

Bills Module

Overview

The Bills module manages tenant invoices and their associated bill line items.
It integrates tightly with the Payments and Wallet modules to support seamless settlements of invoices (rent, utilities, or other charges).

This module is designed to:

Allow Property Managers to create and manage invoices.

Allow Tenants to view invoices and make payments via wallet or external payment methods.

Provide a complete history of invoices, items, and payment receipts.



---

Backend (Django)

Location

backend/bills/

Models

Invoice

Represents the parent bill (rent, utility, other).

Tracks issued date, due date, total amount, and payment status.

Linked to a specific tenant’s apartment.


BillItem

Represents line items under each invoice (e.g., water, electricity, service charge).

Linked to the parent invoice.



Serializers

BillItemSerializer – Handles bill item CRUD.

InvoiceSerializer – Serializes invoices with their items and linked payment records.


Views

InvoiceViewSet

Manages invoices.

Queryset filtered by role:

Tenants only see their own invoices.

Property managers only see invoices for their managed properties.



BillItemViewSet

Manages bill items associated with invoices.



URLs

backend/bills/urls.py

/invoices/ – Invoice endpoints.

/items/ – Bill item endpoints.

/payments/ – Routed via payments app, but exposed for invoice linkage.



---

Frontend (Next.js + React Query)

Location

frontend/app/(dashboard)/bills/

Pages

page.tsx

Fetches and lists invoices for the logged-in tenant or manager.

Displays invoice details with NGN currency formatting.


create/page.tsx

Form for property managers to create new invoices with bill items.


[id]/page.tsx

Invoice detail page showing items and payments.

Provides payment actions (wallet or external).


[id]/pay/page.tsx

Payment workflow UI with wallet and external payment integration.



Components

InvoiceList.tsx

Lists all invoices with filtering by status.


InvoiceForm.tsx

Invoice and bill item creation form.


InvoiceDetail.tsx

Detailed invoice view with items and payments.


BillItemForm.tsx

Sub-form for adding/editing bill items.



Integration

React Query hooks in frontend/lib/hooks/bills.ts:

useInvoices – fetch invoices.

useInvoice – fetch invoice details.

useCreateInvoice – create invoices.

useCreateBillItem – add bill items.


API endpoints align with backend bills/urls.py.



---

Workflow

1. Property Manager

Creates invoice via frontend form.

Adds one or more bill items.

Submits invoice to tenant.



2. Tenant

Views all invoices in their dashboard.

Opens detail page to view bill items and payment history.

Chooses payment method:

Wallet (auto-debit if sufficient balance).

External payment gateway.


Upon successful payment, invoice is marked as paid.



3. Payment Integration

Payment records are stored in payments app.

Wallet transactions are reflected in wallet app.

Bills module consumes payment records for invoice detail views.





---

Role-based Access

Tenants

Can view only their invoices.

Can make payments.


Property Managers

Can create, update, and manage invoices for their properties.

Can add bill items.


Platform/Admin

Can view all invoices system-wide (future extension).




---

Dependencies

Backend: Django REST Framework, Payments App, Wallet App.

Frontend: React Query, Axios, Recharts (for reporting), Shadcn/UI (for forms & modals).



---

Next Steps

Implement Payments module fully for receipts, external gateway integration, and linking to Wallet.

Extend reporting dashboards to show billed vs. paid invoices.



---

✅ The Bills module is now fully integrated with backend and frontend.
Next, we should implement the Payments module before moving forward, since payments complete the invoice lifecycle.


---

Do you want me to proceed immediately with the Payments module implementation (backend + frontend + README) so that Bills can have working payment flows, or should we handle another module first?

