# Rent Module

## Overview
The **Rent module** manages tenant leases, invoicing, rent collection, late fees, and receipts.  
It integrates **frontend (Next.js/React)** with **backend (Django REST Framework)**.

---

## Backend
- **App:** `backend/rents/`
- **Endpoints:**  
  - `GET /rents/tenancies/` → List active tenancies  
  - `POST /rents/tenancies/` → Create tenancy  
  - `GET /rents/invoices/` → List invoices  
  - `POST /rents/invoices/generate/` → Generate invoice  
  - `POST /rents/invoices/{id}/mark_paid/` → Mark invoice paid  
  - `POST /rents/payments/pay_with_wallet/` → Pay invoice with wallet  
  - `POST /rents/payments/record_external/` → Record external payment  
  - `POST /rents/payments/{id}/confirm/` → Confirm payment  
  - `GET /rents/payments/{id}/receipt_pdf/` → Download PDF receipt  

---

## Frontend
### Structure


src/ ├── app/dashboard/rents/page.tsx         # Rent dashboard ├── components/rents/ │    ├── TenancyList.tsx │    ├── TenancyForm.tsx │    ├── InvoiceList.tsx │    ├── InvoiceForm.tsx │    ├── PaymentForm.tsx │    ├── ReceiptViewer.tsx ├── services/rent.service.ts             # API integration ├── store/rent.store.ts                  # Zustand store └── types/rent.types.ts                  # TypeScript interfaces




### Features
- **Tenancies**
  - List, Create, Update
- **Invoices**
  - List, Generate
- **Payments**
  - Wallet & External (bank/cash)
  - Confirm payments
- **Receipts**
  - Download PDF

---

## Integration Notes
- Wallet auto-created at KYC (see User module).  
- Payments update Wallet balance on backend.  
- Receipts are immutable; only generated after confirmed payment.  

---

## Next Steps
- Connect User & KYC modules.  
- Integrate Wallet module deeply with rent flows.  
- Add reporting dashboards (late fees, rent collection trends).
