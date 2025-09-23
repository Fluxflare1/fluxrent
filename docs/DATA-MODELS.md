# FluxRent Data Models

---

## Core Entities

### User
- `uid` (PK, UUID)
- `first_name`
- `last_name`
- `email`
- `phone_number`
- `role` (base, tenant, agent, manager, owner)
- `kyc_completed` (bool)

---

### Wallet
- `id` (PK)
- `user` (FK → User)
- `balance`
- `currency`
- `created_at`

---

### Property
- `id` (PK)
- `manager` (FK → User[role=manager])
- `address`
- `city`
- `country`
- `status` (available, occupied)

---

### Apartment
- `id` (PK)
- `property` (FK → Property)
- `unit_number`
- `tenant` (FK → User[role=tenant], nullable)
- `status` (vacant, occupied)

---

### Bill
- `id` (PK)
- `apartment` (FK → Apartment)
- `type` (rent, utility, community, other)
- `amount`
- `due_date`
- `status` (pending, paid)

---

### Payment
- `id` (PK)
- `wallet` (FK → Wallet)
- `bill` (FK → Bill)
- `amount`
- `method` (wallet, transfer)
- `status` (initiated, confirmed, failed)

---

### Notification
- `id` (PK)
- `user` (FK → User)
- `channel` (email, sms, whatsapp)
- `message`
- `status` (sent, failed)

---

## UID System
- Every user, property, wallet, and apartment receives a globally unique `uid`.
- UIDs are generated at creation and immutable.
