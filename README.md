# Property & Tenant Management MVP

## Quickstart (local)
1. Create `.env` by copying `.env.example` and fill in values (Google service account, sheet id).
2. `cd frontend`
3. `npm install`
4. `npm run dev` (open http://localhost:3000)

Or run with Docker:
1. Populate `.env` at repo root
2. `docker-compose up --build`
3. Open http://localhost:3000

## Sheets setup
Create a Google Sheet with tabs (exact names and header rows):
- `Tenants` : id | name | email | phone | tenant_type | property | unit | kyc_link | status | start_date | end_date | created_at
- `Payments`: id | payment_reference | tenant_id | tenant_name | date | type | amount | method | status | notes | created_at

Share the Google Sheet with your service account email (Editor).

## Notes
- Do not commit secrets.
- For production, use secret manager and secure the service account.
