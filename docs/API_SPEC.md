# FluxRent API Specification

Version: 1.0

---

## Auth & Users
- `POST /api/auth/register/` → Create Access Account
- `POST /api/auth/login/` → Login
- `POST /api/auth/kyc/` → Complete KYC
- `GET /api/users/me/` → Current User Profile
- `POST /api/users/role/` → Assign role (Tenant, Agent, Manager)

---

## Properties
- `POST /api/properties/` → Create property
- `GET /api/properties/` → List properties
- `GET /api/properties/:id/` → Property details
- `POST /api/properties/:id/bond/` → Bond tenant
- `POST /api/properties/:id/agents/` → Add agent

---

## Bills
- `POST /api/bills/` → Create bill (Rent/Utility/Other)
- `GET /api/bills/` → List bills
- `GET /api/bills/:id/` → Bill details

---

## Wallets
- `GET /api/wallets/` → View wallet
- `POST /api/wallets/fund/` → Fund wallet
- `POST /api/wallets/withdraw/` → Withdraw funds

---

## Payments
- `POST /api/payments/` → Initiate payment
- `GET /api/payments/:id/` → Payment status
- `POST /api/payments/confirm/` → Manual confirmation

---

## Notifications
- `POST /api/notifications/email/` → Send email
- `POST /api/notifications/sms/` → Send SMS
- `POST /api/notifications/whatsapp/` → Send WhatsApp

---

## Owner
- `GET /api/owner/dashboard/` → Platform overview
- `GET /api/owner/users/` → List users
- `GET /api/owner/transactions/` → Platform-wide financials
