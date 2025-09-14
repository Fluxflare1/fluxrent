Perfect 👌 now that we’ve locked in the multi-tenant SRS, let’s expand the repo structure so it directly supports:

Admin Panel

Property Manager Panel

Agent Portal

Tenant Portal

Public Listings module


and also the services for listings, agents, approvals, notifications, etc.

Here’s the updated repo structure v2.0 aligned with the new SRS:


---

📂 Repo Structure — property-tenant-mgmt-mvp/

property-tenant-mgmt-mvp/
│── .env.example                 # Environment variable template
│── .gitignore                   # Git ignore rules
│── docker-compose.yml           # Orchestration (Next.js + services)
│── Dockerfile                   # Docker setup for Next.js app
│── package.json                 # Root package.json (workspace mgmt)
│── README.md                    # Project overview & setup
│
├── frontend/                    # Next.js 13+ (App Router)
│   │── next.config.js
│   │── package.json
│   │── tailwind.config.js
│   │── tsconfig.json
│   │
│   ├── app/                     # Next.js app routes
│   │   ├── admin/               # Platform Admin Panel
│   │   │   ├── dashboard/
│   │   │   ├── approvals/
│   │   │   ├── users/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   │
│   │   ├── property-admin/      # Landlord / Property Manager Panel
│   │   │   ├── dashboard/
│   │   │   ├── properties/
│   │   │   ├── tenants/
│   │   │   ├── payments/
│   │   │   ├── utilities/
│   │   │   ├── accounts/
│   │   │   └── agreements/
│   │   │
│   │   ├── agent/               # Agent Portal
│   │   │   ├── dashboard/
│   │   │   ├── listings/
│   │   │   ├── inspections/
│   │   │   ├── commissions/
│   │   │   └── profile/
│   │   │
│   │   ├── tenant/              # Tenant Portal
│   │   │   ├── dashboard/
│   │   │   ├── payments/
│   │   │   ├── agreements/
│   │   │   ├── statements/
│   │   │   ├── listings/        # Internal property search for tenants
│   │   │   └── profile/
│   │   │
│   │   ├── listings/            # Public Marketplace (Property Search)
│   │   │   ├── index.tsx        # Listings homepage
│   │   │   ├── [listingId]/     # Property details page
│   │   │   └── search/          # Advanced search filters
│   │   │
│   │   ├── api/                 # Next.js API routes (proxy to services)
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── listings/
│   │   │   ├── payments/
│   │   │   ├── notifications/
│   │   │   └── google/
│   │   │
│   │   ├── landing/             # Public landing pages
│   │   │   ├── page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── LandingHero.tsx
│   │   │   └── LandingNavbar.tsx
│   │   │
│   ├── components/              # Shared UI components
│   ├── hooks/                   # Reusable React hooks
│   ├── lib/                     # Utilities (auth, API clients, helpers)
│   ├── styles/                  # Tailwind & global styles
│   └── public/                  # Static assets
│
├── services/                    # Backend service layer (TypeScript workers)
│   ├── auth/                    # Authentication & approvals
│   │   ├── signup.service.ts
│   │   ├── approval.service.ts
│   │   └── user-uid.generator.ts
│   │
│   ├── google/                  # Google integrations
│   │   ├── sheets.service.ts    # CRUD for Sheets
│   │   ├── drive.service.ts     # Upload/download documents
│   │   └── auth.service.ts      # Google OAuth
│   │
│   ├── payments/                # Paystack integration
│   │   ├── paystack.service.ts
│   │   └── webhook.handler.ts
│   │
│   ├── notifications/           # Email + WhatsApp services
│   │   ├── email.service.ts
│   │   ├── whatsapp.service.ts
│   │   └── templates/
│   │
│   ├── listings/                # Listings service (Marketplace + Tenant search)
│   │   ├── listings.service.ts
│   │   ├── search.service.ts
│   │   └── inspection.service.ts
│   │
│   ├── agents/                  # Agent-specific logic
│   │   ├── agents.service.ts
│   │   └── commissions.service.ts
│   │
│   └── accounts/                # Accounting & ledgers
│       ├── ledger.service.ts
│       ├── cashbook.service.ts
│       └── statements.service.ts
│
├── scripts/                     # Helper scripts
│   ├── seed-data.ts             # Seed Google Sheets with demo data
│   ├── backup-to-drive.ts       # Backup Sheets → Drive
│   └── generate-uids.ts         # Unique ID generation for properties, tenants, agents
│
└── docs/                        # Documentation
    ├── SRS.md                   # Software Requirements Specification
    ├── API-Specs.md             # API routes & request/response formats
    ├── DATA-MODELS.md           # Entity & ID structure (Property, Tenant, Agent, etc.)
    └── DEPLOYMENT.md            # Deployment guide (Docker + GitHub Actions)


---

🔑 Key Updates from Previous Repo

1. Four Panels separated in frontend/app/:

/admin/ → Platform Admin

/property-admin/ → Landlord/Property Manager

/agent/ → Agent Portal

/tenant/ → Tenant Portal



2. Marketplace Listings → /listings/ (public-facing, but also embedded in tenant portal).


3. Services layer expanded:

/listings/ → manages property listings, search, inspections.

/agents/ → tracks commissions, direct/indirect listings.

/auth/ → signup approval flow + UID generation.



4. Docs update → Added DATA-MODELS.md to describe UID patterns (NGN codes, tenant UID, property UID, etc.).


5. Scripts update → generate-uids.ts to keep ID generation consistent across entities.




---

⚡ This repo structure sets us up so the MVP runs on Next.js frontend + Google APIs as backend services, with the flexibility to swap Sheets → Postgres later without breaking the repo layout.

Do you want me to also sketch the UID generation scheme in detail (with regex/pattern examples) inside the DATA-MODELS.md — so we standardize property IDs, tenant IDs, and agent IDs right now?

