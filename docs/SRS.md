

Software Requirements Specification (SRS)

System Name: Property & Tenant Management SaaS Platform (Multi-tenant)
Version: MVP v2.0 (with Marketplace & Multi-Portal support)
Author: [Your Company / Fluxflare]


---

1. Introduction

1.1 Purpose

This document defines the functional and non-functional requirements for a SaaS-based Property & Tenant Management Platform. The system is multi-tenant, enabling platform admins, property managers, agents, and tenants to interact within a single ecosystem. It integrates property listings/search (public-facing + internal), rent & utilities management, accounts & ledgers, notifications, and third-party integrations (Google Sheets, Drive, Paystack, WhatsApp).

1.2 Scope

The system will serve as:

1. Property Management System – for landlords/managers to manage properties, units, tenants, utilities, and finances.


2. Tenant Management Portal – for tenants to access leases, make payments, receive receipts, and manage agreements.


3. Agent Portal – for agents to list, manage, and re-list properties, earn commissions, and manage inspections.


4. Marketplace Module – public-facing property listing/search portal for discovery of available rentals and sales.



The system is delivered as a hybrid SaaS app (Web-first, Desktop possible via Electron wrapper).


---

2. User Classes and Characteristics

1. Platform Admin

Manages the entire platform.

Approves/rejects new signups (Agents, Property Managers).

Oversees compliance, commissions, and platform-wide analytics.



2. Property Manager Admin (Landlord)

Registers properties and apartments.

Manages tenants, rent payments, utilities, and agreements.

Generates property-specific ledgers/statements.



3. Agent

Lists properties (direct listings).

Re-lists other agents’ properties (tagged as indirect).

Schedules inspections with prospective tenants.

Earns commission on successful leases/sales.



4. Tenant

Auto-approved upon signup.

Can search properties (public-facing + inside tenant portal).

Books inspections, signs agreements, and makes payments.

Receives receipts, statements, and notifications.





---

3. System Features

3.1 Authentication & Access Control

Signup options for Admin, Property Manager, Agent, Tenant.

Tenants → auto-approved.

Agents & Property Managers → require Admin approval (status visible: Pending, Approved, Rejected, Queried).

Email confirmation sent with login credentials after signup.

Role-based dashboards after login.


3.2 Property & Unit Management

Property Managers register properties → system generates unique property ID.

Each apartment/unit gets a unique sub-ID under the property.

Property/Unit ID format:
NGN<StateCode>/<LGA>/<StreetCode>/<HouseCode>/APTMT/<Number>


3.3 Tenant Management

Tenant receives unique Tenant UID (auto-generated).

UID format:
TNT/<StateCode>/<LGACode>/<PersonalNumber>

UID maps tenant to a specific property/apartment.

Tenant dashboard shows agreements, payments, and status.


3.4 Agent Management

Agent receives unique Agent UID.

Agents can:

List properties (Direct).

Re-list properties from other agents (Indirect).


Agent commission tracking (direct vs indirect).


3.5 Property Listings & Search (Marketplace Module)

Public-facing property search → /listings/.

Accessible from landing page OR subdomain (listings.domain.com).

Listings can also be accessed inside tenant portal (for cross-sell).

Property details include images, description, rent/lease amount, agent/manager info.

Inspection booking system (tenant → agent).


3.6 Payments & Receipts

Integration with Paystack.

Online rent/lease payments with receipts auto-stored in Google Drive.

Payment history linked to tenant ledger.

Webhook support for status updates.


3.7 Utilities & Accounts

Property managers record utility usage (electricity, water, etc.).

Automatic billing to tenants based on usage.

Accounting module includes:

Personal Ledgers (tenant-specific, property-specific).

General Ledger.

Cash Book.

Accruals/Prepayments.

Statements of Accounts.



3.8 Agreement & Document Management

Store agreements, receipts, inspection reports in Google Drive.

Drive-linked file management per tenant/property.


3.9 Notifications & Communication

Email notifications for approvals, receipts, agreements.

WhatsApp Cloud API integration for reminders (rent due, inspection schedules, etc.).

Templates for standardized communication.



---

4. External Interfaces

4.1 Google APIs

Sheets API – acts as lightweight database for MVP.

Drive API – stores agreements, receipts, backups.

OAuth2 – authentication for API access.


4.2 Paystack API

Online payments and webhook event handling.


4.3 WhatsApp Cloud API

Automated reminders and communication.



---

5. Non-Functional Requirements

Multi-Tenant Architecture → supports multiple landlords/agents.

Scalability → can transition from Sheets-based MVP to full DB (Postgres).

Security → role-based access, JWT sessions, data encryption.

Availability → Dockerized deployment, CI/CD support via GitHub.

Extensibility → support for additional modules (maintenance requests, financing).



---

6. Panels & Navigation

1. Admin Panel (/admin/)

Manage all users, approvals, platform settings.

View analytics, commissions, compliance.



2. Property Manager Panel (/property-admin/)

Manage properties, tenants, utilities, payments.

Generate property-specific financials.



3. Agent Portal (/agent/)

Manage listings (direct & indirect).

Book inspections and track commissions.



4. Tenant Portal (/tenant/)

Dashboard with agreements, payments, receipts.

Search properties inside portal.

Tenant UID shown after approval.



5. Public Listings (/listings/)

Property search module, accessible publicly.

Detailed property pages with inspection booking.





---

7. Data Models (High-Level)

Property: { propertyID, address, stateCode, LGACode, streetCode, houseCode, managerID }

Apartment: { apartmentID, propertyID, tenantID }

Tenant: { tenantUID, name, contact, linkedApartmentID, status }

Agent: { agentUID, name, directListings, indirectListings, commissions }

Listing: { listingID, propertyID, agentID, type: direct/indirect, status }

Payment: { paymentID, tenantID, propertyID, amount, method, date, receiptLink }

Agreement: { agreementID, tenantID, propertyID, driveLink, status }



---

8. Future Extensions

Mobile app (React Native or Flutter).

Maintenance request module.

AI-based rent affordability scoring.

Integration with local credit bureaus.



---

✅ This updated SRS now reflects:

Multi-panel design (Admin, Property Manager, Agent, Tenant).

Marketplace Listings (public + tenant internal view).

Approval workflows for signup.

Unique ID scheme for properties, apartments, tenants, and agents.

Agent indirect/direct listing system.


