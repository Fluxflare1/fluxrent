fluxrent/
├── backend/                         # Django backend
│   ├── manage.py
│   ├── config/                      # Django project settings & urls
│   │   ├── __init__.py
│   │   ├── asgi.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   │
│   ├── users/                       # Auth, KYC, role mgmt
│   ├── properties/                  # Property & apartment mgmt
│   ├── bills/                       # Rent & bill separation
│   ├── wallets/                     # Wallet balances, transactions
│   ├── payments/                    # Payment lifecycle
│   ├── notifications/               # Email, SMS, WhatsApp alerts
│   └── owner/                       # Platform owner oversight
│
├── frontend/                        # Next.js frontend
│   ├── app/                         # App router
│   │   ├── (landing)/               # Public landing pages
│   │   ├── (auth)/                  # Login, signup, access requests
│   │   ├── dashboard/               # User dashboards
│   │   │   ├── tenant/
│   │   │   ├── manager/
│   │   │   ├── agent/
│   │   │   └── owner/
│   │   └── layout.tsx               # Global layout (shadcn, tailwind)
│   │
│   ├── components/                  # Shared UI components
│   ├── lib/                         # Utils, API calls, configs
│   ├── styles/                      # Global Tailwind styles
│   └── package.json
│
├── docs/                            # Documentation
│   ├── SRS.md                       # Software Requirements Specification
│   ├── API_SPEC.md                  # API contracts
│   └── DATA_MODELS.md               # Entity-relationship & UID mapping
│
├── docker/                          # Docker configs
│   ├── backend.Dockerfile
│   ├── frontend.Dockerfile
│   └── nginx/                       # Reverse proxy configs
│       └── default.conf
│
├── docker-compose.yml                # Orchestration
├── .env.example                      # Environment variables template
├── README.md                         # Project overview
└── requirements.txt                  # Python dependencies
