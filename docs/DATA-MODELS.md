Got it ✅ — let’s lock down a UID generation scheme so that every entity (Property, Apartment, Tenant, Agent) has a 

📄 DATA-MODELS.md

1. UID Generation Overview

Each entity in the system (Property, Apartment, Tenant, Agent) must have a globally unique identifier (UID).
The UID must:

Be alphanumeric and human-readable.

Encode location (State & LGA codes).

Encode entity type (Property, Apartment, Tenant, Agent).

Be sequential for easier tracking.

Be machine-validated using regex patterns.



---

2. Property UID

Structure

NGN[STATE_CODE]/[LGA_CODE]/[STREET_CODE]/[HOUSE_CODE]

NGN → Country code (Nigeria).

STATE_CODE → 2-digit code for state.

LGA_CODE → 2-digit code for local government area.

STREET_CODE → 2-digit code assigned to the street.

HOUSE_CODE → 2-digit code per property on the street.


Example

NGN01/08/20/05

Meaning: Lagos State (01), Alimosho LGA (08), Street 20, House 05.

Regex Validation

^NGN\d{2}/\d{2}/\d{2}/\d{2}$


---

3. Apartment UID

Apartments are sub-units under a Property.

Structure

[PROPERTY_UID]/APTMT/[SEQ_NO]

[PROPERTY_UID] → Parent property code.

APTMT → Keyword for apartment.

SEQ_NO → Apartment number (01, 02, 03...).


Example

NGN01/08/20/05/APTMT/01

Regex Validation

^NGN\d{2}/\d{2}/\d{2}/\d{2}/APTMT/\d{2}$


---

4. Tenant UID

Tenants are segmented by state & LGA where they register.

Structure

TNT/[STATE_CODE]/[LGA_CODE]/[SEQ_NO]

TNT → Tenant prefix.

STATE_CODE → 2-digit state code.

LGA_CODE → 2-digit LGA code.

SEQ_NO → Sequential number of tenant in that LGA.


Example

TNT/01/08/00045

Meaning: Tenant registered in Lagos State (01), Alimosho LGA (08), 45th tenant.

Regex Validation

^TNT/\d{2}/\d{2}/\d{5}$


---

5. Agent UID

Agents also follow location-based UIDs, with an AGT prefix.

Structure

AGT/[STATE_CODE]/[LGA_CODE]/[SEQ_NO]

AGT → Agent prefix.

STATE_CODE → 2-digit state code.

LGA_CODE → 2-digit LGA code.

SEQ_NO → Sequential number of agent in that LGA.


Example

AGT/01/08/0012

Meaning: Agent registered in Lagos State (01), Alimosho LGA (08), 12th agent.

Regex Validation

^AGT/\d{2}/\d{2}/\d{4}$


---

6. Rules

1. Uniqueness:

Each UID must be unique across the system.

Generated via a central UID service (scripts/generate-uids.ts).



2. Human-readability:

Encodes country → state → LGA → entity.

Easier for landlords, tenants, and admins to verify.



3. Auto-Incremented:

SEQ_NO values auto-increment per LGA.

No two tenants in the same LGA will share the same sequence.



4. Mapping:

Tenant UID + Apartment UID establishes occupancy link.

Agent UID + Property UID establishes listing ownership.





---

7. Example Mappings

Tenant-to-Apartment Mapping

Tenant: TNT/01/08/00045
Apartment: NGN01/08/20/05/APTMT/01
→ This tenant is linked to Apartment 01 at Property NGN01/08/20/05

Agent-to-Listing Mapping

Agent: AGT/01/08/0012
Property: NGN01/08/20/05
→ This agent is responsible for listing Property NGN01/08/20/05



---

⚡ With this scheme, IDs are predictable, regex-validatable, and location-aware, making it easy to query/filter users and assets across the SaaS.


---

👉 Do you want me to also draft the TypeScript UID generator functions (scripts/generate-uids.ts) that follow these regex patterns, so IDs are auto-generated instead of manually entered?

