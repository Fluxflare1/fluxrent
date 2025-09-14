export function generateTenantUID(stateCode: string, lgaCode: string, seq: number) {
  return `TNT/${stateCode}/${lgaCode}/${seq.toString().padStart(3, "0")}`;
}

export function generatePropertyUID(
  stateCode: string,
  lgaCode: string,
  streetCode: string,
  houseCode: string
) {
  return `NGN/${stateCode}/${lgaCode}/${streetCode}/${houseCode}`;
}

export function generateAgentUID(stateCode: string, lgaCode: string, seq: number) {
  return `AGT/${stateCode}/${lgaCode}/${seq.toString().padStart(3, "0")}`;
}
