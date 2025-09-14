// frontend/scripts/generate-uids.ts
/**
 * UID helpers for Property / Apartment / Tenant / Agent
 * These are simple deterministic generators (timestamp-based).
 * In production you should use a centralized counter for seq numbers.
 */

export function genPropertyUID(stateCode = "01", lgaCode = "01", streetCode = "01", houseCode = "01") {
  // NGN[STATE]/[LGA]/[STREET]/[HOUSE]
  return `NGN${pad2(stateCode)}/${pad2(lgaCode)}/${pad2(streetCode)}/${pad2(houseCode)}`;
}

export function genApartmentUID(propertyUID: string, seq = 1) {
  return `${propertyUID}/APTMT/${pad2(seq)}`;
}

export function genTenantUID(stateCode = "01", lgaCode = "01", seq = 1) {
  // TNT/01/01/00001
  return `TNT/${pad2(stateCode)}/${pad2(lgaCode)}/${pad5(seq)}`;
}

export function genAgentUID(stateCode = "01", lgaCode = "01", seq = 1) {
  return `AGT/${pad2(stateCode)}/${pad2(lgaCode)}/${pad4(seq)}`;
}

function pad2(v: string | number) {
  return String(v).padStart(2, "0");
}
function pad4(v: string | number) {
  return String(v).padStart(4, "0");
}
function pad5(v: string | number) {
  return String(v).padStart(5, "0");
}
