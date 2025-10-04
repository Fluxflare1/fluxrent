# User + KYC Module (FluxRent)

This module implements **User Management and KYC flow** according to the FluxRent SRS.

## Features
- Request Access (FR1.x)
- Login / JWT authentication
- KYC form gating (FR2.x)
- Dashboard with UID + Wallet
- Password change
- Role-based routing (Tenant, Property Manager, Owner)

## Backend Endpoints
- `POST /users/request-access/` → Create pending user + email
- `POST /auth/token/` → Login (JWT)
- `POST /auth/token/refresh/` → Refresh JWT
- `GET /users/me/` → Current user profile
- `PUT /users/{id}/kyc/` → Complete KYC
- `POST /users/{id}/set_password/` → Change password

## Frontend Pages
- `/access/request` → Request Access form
- `/auth/login` → Login
- `/kyc` → Complete KYC
- `/dashboard` → User dashboard

## Libraries
- Next.js 14 (App Router)
- TailwindCSS
- Shadcn UI
- Axios (API client)
- JWT auth with refresh

## Usage
1. Request Access → user receives email
2. Login with credentials → redirected to KYC if incomplete
3. Complete KYC → wallet generated
4. Redirected to Dashboard
