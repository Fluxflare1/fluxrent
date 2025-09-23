# Software Requirements Specification (SRS)

**FluxRent Platform: Universal Property Ecosystem with Integrated Financial Identity**  
**Version:** 4.0  
**Date:** October 26, 2023  
**Status:** Draft - Full Platform Specification  

---

## 1. Introduction

### 1.1 Purpose
This document describes the complete functional and non-functional requirements for the FluxRent Platform.

### 1.2 Scope
FluxRent is a web-based ecosystem for managing properties, tenants, and financial flows.

### 1.3 Definitions
- UID: Unique Identifier
- DVA: Dedicated Virtual Account (Paystack)
- KYC: Know Your Customer
- CRM: Customer Relationship Management
- PM: Property Manager
- SoS: Statement of Stay

---

## 2. Overall Description

### 2.1 Product Perspective
FluxRent integrates:
- Paystack API for DVA & payments
- Email Service
- WhatsApp Business API
- SMS service
- Mapping APIs (location services)

### 2.2 User Classes
- **Platform Owner** – full system oversight
- **Property Manager** – manages properties & tenants
- **Finder/Agent** – lists properties, handles inspections
- **Tenant** – bonds with apartments & pays bills
- **Base User** – has an access account before role assignment

### 2.3 Operating Environment
- Next.js + TailwindCSS + shadcn-ui (frontend)
- Django + DRF + PostgreSQL (backend)
- Dockerized deployment
- UID system follows `/docs/DATA_MODELS.md`

---

## 3. System Features
Full feature set [FT-1 … FT-12] as described earlier, covering:
- Access system
- KYC & onboarding
- Business accounts
- Tenant-role management
- Property manager/agent functions
- Dashboard structures
- Owner admin panel
- Bonding system
- Rent/bill separation
- Payments
- Tenant exit
- Tenant dashboards

---

## 4. External Interface Requirements
- Paystack
- WhatsApp Business API
- Email
- SMS

---

## 5. Non-Functional Requirements
- **Performance**: High transaction volume
- **Security**: Protect PII & financial data
- **Reliability**: High uptime
- **Data Integrity**: UID consistency
