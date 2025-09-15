// frontend/lib/googleSheets.ts
// Production-ready Google Sheets helpers used by the app.
// Exports many named functions referenced across API routes.
// Uses a Google service account (GOOGLE_CLIENT_EMAIL + GOOGLE_PRIVATE_KEY).
import { google, sheets_v4, drive_v3 } from "googleapis";

const SHEET_ID = process.env.GOOGLE_SHEETS_ID || process.env.GOOGLE_SHEET_ID || "";
if (!SHEET_ID) {
  // do not throw here — some flows may run without sheets in dev, but log for visibility
  console.warn("Warning: GOOGLE_SHEETS_ID / GOOGLE_SHEET_ID not set.");
}

function getAuth() {
  const client_email = process.env.GOOGLE_CLIENT_EMAIL;
  const private_key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!client_email || !private_key) {
    throw new Error("Missing Google service account credentials (GOOGLE_CLIENT_EMAIL or GOOGLE_PRIVATE_KEY).");
  }

  return new google.auth.GoogleAuth({
    credentials: { client_email, private_key },
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive",
    ],
  });
}

/** Returns a sheets client (synchronous-like). Use `await getSheets()` when you prefer async caller style */
export async function getSheets(): Promise<sheets_v4.Sheets> {
  const auth = getAuth();
  // returning sheets client bound to the auth instance
  return google.sheets({ version: "v4", auth }) as sheets_v4.Sheets;
}

/** Alias names used across the repo */
export async function googleSheets() { return getSheets(); }
export async function getGoogleSheets() { return getSheets(); }

/** Drive client helper */
export async function getDrive() : Promise<drive_v3.Drive> {
  const auth = getAuth();
  return google.drive({ version: "v3", auth }) as drive_v3.Drive;
}

/* --------------------------
   Utility helpers
   -------------------------- */

async function readRange(range: string) {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range,
  });
  return res.data.values || [];
}

async function appendRange(range: string, values: any[][]) {
  const sheets = await getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });
}

async function updateRange(range: string, values: any[][]) {
  const sheets = await getSheets();
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });
}

async function batchUpdateRanges(data: { range: string; values: any[][] }[]) {
  const sheets = await getSheets();
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { valueInputOption: "USER_ENTERED", data },
  });
}

/* --------------------------
   Bootstrap: create missing tabs
   -------------------------- */
export async function ensureSheetTabs() {
  const sheets = await getSheets();
  const required = [
    "Properties",
    "Apartments",
    "Tenants",
    "Users",
    "Payments",
    "Bills",
    "BillPayments",
    "Invoices",
    "Receipts",
    "Utilities",
    "Notifications",
    "Templates",
    "RentSchedules",
    "Ledger",
    "Agreements",
  ];

  // get meta
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const existing = (meta.data.sheets || []).map((s) => s.properties?.title).filter(Boolean) as string[];

  const missing = required.filter((r) => !existing.includes(r));
  if (missing.length === 0) return { created: 0 };

  const requests = missing.map((title) => ({ addSheet: { properties: { title } } }));
  await sheets.spreadsheets.batchUpdate({ spreadsheetId: SHEET_ID, requestBody: { requests } });

  // optionally set headers for newly created sheets
  const headerMap: Record<string, string[]> = {
    Users: ["id", "email", "passwordHash", "role", "name", "created_at"],
    Tenants: ["id", "name", "email", "phone", "tenant_type", "property", "unit", "kyc_link", "status", "start_date", "end_date", "created_at"],
    Properties: ["id", "name", "address", "city", "state", "country", "num_units", "created_at"],
    Apartments: ["id", "property_id", "unit_number", "type", "size", "rent_amount", "status", "tenant_id", "tenant_name", "lease_start", "lease_end", "created_at"],
    Payments: ["id", "payment_reference", "tenant_id", "tenant_name", "date", "type", "amount", "method", "status", "notes", "created_at", "receipt_link"],
    Bills: ["id","apartment_id","bill_type","period","issue_date","due_date","amount","balance","status","linked_schedule_id","tenant_id","tenant_name","created_at","notes","invoice_id","source"],
    BillPayments: ["id","bill_id","payment_reference","payer_tenant_id","payer_name","amount","method","verified","receipt_link","created_at","notes"],
    Utilities: ["id","tenant_id","month","LAWMA","Cleaner","Water","Community","Misc","BankCharges","total","created_at"],
    Notifications: ["id","type","to","payload","status","created_at"],
    Templates: ["id","name","type","content","created_at"],
    RentSchedules: ["id","apartment_id","tenant_id","tenant_name","due_date","period","amount","status","payment_reference","paid_date","invoice_id","created_at","notes"]
  };

  const updates: { range: string; values: any[][] }[] = [];
  for (const title of missing) {
    const headers = headerMap[title];
    if (headers) updates.push({ range: `${title}!A1:${String.fromCharCode(64 + headers.length)}1`, values: [headers] });
  }
  if (updates.length) await batchUpdateRanges(updates);

  return { created: missing.length, missing };
}

/* --------------------------
   Users (for auth)
   -------------------------- */

export async function getUserByEmail(email: string) {
  const rows = await readRange("Users!A2:F");
  const found = rows.find((r: any[]) => (r[1] || "").toLowerCase() === String(email).toLowerCase());
  if (!found) return null;
  const [id, e, passwordHash, role, name, created_at] = found;
  return { id, email: e, passwordHash, role, name, created_at };
}

export async function addUser(user: { id: string; email: string; passwordHash: string; role?: string; name?: string }) {
  const row = [
    user.id,
    user.email,
    user.passwordHash,
    user.role || "tenant",
    user.name || "",
    new Date().toISOString(),
  ];
  await appendRange("Users!A2", [row]);
  return { ok: true, id: user.id };
}

export async function verifyPassword(email: string, plain: string) {
  const u = await getUserByEmail(email);
  if (!u || !u.passwordHash) return false;
  // do NOT import bcrypt here; caller can use bcrypt to compare passwordHash
  // But include a convenience compare using bcrypt if available
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const bcrypt = require("bcryptjs");
    return await bcrypt.compare(plain, u.passwordHash);
  } catch {
    // fallback - if passwordHash equals plain (not secure) - for dev only
    return u.passwordHash === plain;
  }
}

/* --------------------------
   Tenants
   -------------------------- */
export async function getTenants() {
  const rows = await readRange("Tenants!A2:L");
  return rows.map((r: any[]) => ({
    id: r[0] || "",
    name: r[1] || "",
    email: r[2] || "",
    phone: r[3] || "",
    tenant_type: r[4] || "",
    property: r[5] || "",
    unit: r[6] || "",
    kyc_link: r[7] || "",
    status: r[8] || "",
    start_date: r[9] || "",
    end_date: r[10] || "",
    created_at: r[11] || "",
  }));
}

export async function addTenant(data: any) {
  const id = data.id || `TNT_${Date.now()}`;
  const row = [
    id,
    data.name || "",
    data.email || "",
    data.phone || "",
    data.tenant_type || "",
    data.property || "",
    data.unit || "",
    data.kyc_link || "",
    data.status || "active",
    data.start_date || "",
    data.end_date || "",
    data.created_at || new Date().toISOString(),
  ];
  await appendRange("Tenants!A2", [row]);
  return { id, ...data };
}

export async function updateTenantKyc(tenantId: string, kycLink: string) {
  const rows = await readRange("Tenants!A2:L");
  const idx = rows.findIndex((r: any[]) => (r[0] || "") === tenantId);
  if (idx === -1) throw new Error("Tenant not found");
  const rowNumber = idx + 2;
  await updateRange(`Tenants!H${rowNumber}`, [[kycLink]]);
  return { ok: true, tenantId, kycLink };
}

/* --------------------------
   Properties & Apartments
   -------------------------- */
export async function getProperties() {
  const rows = await readRange("Properties!A2:H");
  return rows.map((r: any[]) => ({
    id: r[0] || "",
    name: r[1] || "",
    address: r[2] || "",
    city: r[3] || "",
    state: r[4] || "",
    country: r[5] || "",
    num_units: Number(r[6] || 0),
    created_at: r[7] || "",
  }));
}

export async function addProperty(data: any) {
  const id = data.id || `PROP_${Date.now()}`;
  const row = [id, data.name || "", data.address || "", data.city || "", data.state || "", data.country || "", data.num_units || 0, new Date().toISOString()];
  await appendRange("Properties!A2", [row]);
  return { id, name: data.name };
}

export async function getApartments(propertyId?: string) {
  const rows = await readRange("Apartments!A2:L");
  const items = rows.map((r: any[]) => ({
    id: r[0] || "",
    property_id: r[1] || "",
    unit_number: r[2] || "",
    type: r[3] || "",
    size: r[4] || "",
    rent_amount: Number(r[5] || 0),
    status: r[6] || "",
    tenant_id: r[7] || "",
    tenant_name: r[8] || "",
    lease_start: r[9] || "",
    lease_end: r[10] || "",
    created_at: r[11] || "",
  }));
  return propertyId ? items.filter(i => i.property_id === propertyId) : items;
}

export async function addApartment(data: any) {
  const id = data.id || `APT_${Date.now()}`;
  const row = [
    id,
    data.property_id || "",
    data.unit_number || "",
    data.type || "",
    data.size || "",
    Number(data.rent_amount || 0),
    data.status || "vacant",
    data.tenant_id || "",
    data.tenant_name || "",
    data.lease_start || "",
    data.lease_end || "",
    new Date().toISOString(),
  ];
  await appendRange("Apartments!A2", [row]);
  return { id, property_id: data.property_id, unit_number: data.unit_number };
}

export async function assignTenantToApartment(apartmentId: string, tenantId: string, tenantName: string, leaseStart?: string, leaseEnd?: string) {
  const rows = await readRange("Apartments!A2:L");
  const idx = rows.findIndex((r:any[]) => (r[0] || "") === apartmentId);
  if (idx === -1) throw new Error("Apartment not found");
  const sheetRow = idx + 2;
  const updates: { range: string; values: any[][] }[] = [
    { range: `Apartments!H${sheetRow}`, values: [[tenantId]] },
    { range: `Apartments!I${sheetRow}`, values: [[tenantName]] },
  ];
  if (leaseStart) updates.push({ range: `Apartments!J${sheetRow}`, values: [[leaseStart]] });
  if (leaseEnd) updates.push({ range: `Apartments!K${sheetRow}`, values: [[leaseEnd]] });
  await batchUpdateRanges(updates);
  return { ok: true };
}

/* --------------------------
   Payments & Bills
   -------------------------- */

export async function getPayments() {
  const rows = await readRange("Payments!A2:L");
  return rows.map((r:any[]) => ({
    id: r[0] || "",
    payment_reference: r[1] || "",
    tenant_id: r[2] || "",
    tenant_name: r[3] || "",
    date: r[4] || "",
    type: r[5] || "",
    amount: Number(r[6] || 0),
    method: r[7] || "",
    status: r[8] || "",
    notes: r[9] || "",
    created_at: r[10] || "",
    receipt_link: r[11] || ""
  }));
}

export async function recordPayment(data: any) {
  const id = data.id || `P_${Date.now()}`;
  const row = [
    id,
    data.payment_reference || id,
    data.tenant_id || "",
    data.tenant_name || "",
    data.date || new Date().toISOString(),
    data.type || "rent",
    Number(data.amount || 0),
    data.method || "manual",
    data.status || "pending",
    data.notes || "",
    new Date().toISOString(),
    data.receipt_link || ""
  ];
  await appendRange("Payments!A2", [row]);
  return row;
}

export async function recordPaymentFromPaystack(data: any) {
  // data: { reference, amount, customer_email, metadata }
  const id = `P_${Date.now()}`;
  const reference = data.reference || `ref_${Date.now()}`;
  const amountFloat = Number(data.amount || 0) / 100;
  const row = [
    id,
    reference,
    data.metadata?.tenant_id || "",
    data.metadata?.tenant_name || data.customer_email || "",
    new Date().toISOString(),
    "rent",
    amountFloat,
    "paystack",
    "paid",
    JSON.stringify(data.metadata || {}),
    new Date().toISOString(),
    ""
  ];
  await appendRange("Payments!A2", [row]);
  return row;
}

export async function addReceiptLinkToPayment(ref: string, link: string) {
  const rows = await readRange("Payments!A2:L");
  const idx = rows.findIndex((r:any[]) => (r[1] || "") === ref);
  if (idx === -1) throw new Error("Payment not found");
  const rowNumber = idx + 2;
  await updateRange(`Payments!L${rowNumber}`, [[link]]);
  return { ok: true, ref, link };
}

/* --------------------------
   Bills and BillPayments
   -------------------------- */
export async function addBill(data: any) {
  const id = data.id || `BILL_${Date.now()}`;
  const amount = Number(data.amount || 0);
  const row = [
    id,
    data.apartment_id || "",
    data.bill_type || "rent",
    data.period || "",
    data.issue_date || new Date().toISOString().split("T")[0],
    data.due_date || "",
    amount,
    Number(data.balance ?? amount),
    data.status || "due",
    data.linked_schedule_id || "",
    data.tenant_id || "",
    data.tenant_name || "",
    new Date().toISOString(),
    data.notes || "",
    data.invoice_id || "",
    data.source || "manual"
  ];
  await appendRange("Bills!A2", [row]);
  return { id: row[0], apartment_id: row[1], amount: row[6], balance: row[7], status: row[8], due_date: row[5] };
}

export async function getBills(filters: any = {}) {
  const rows = await readRange("Bills!A2:P");
  const items = rows.map((r: any[]) => ({
    id: r[0] || "",
    apartment_id: r[1] || "",
    bill_type: r[2] || "",
    period: r[3] || "",
    issue_date: r[4] || "",
    due_date: r[5] || "",
    amount: Number(r[6] || 0),
    balance: Number(r[7] || 0),
    status: r[8] || "",
    linked_schedule_id: r[9] || "",
    tenant_id: r[10] || "",
    tenant_name: r[11] || "",
    created_at: r[12] || "",
    notes: r[13] || "",
    invoice_id: r[14] || "",
    source: r[15] || ""
  }));
  return items.filter(item => {
    if (filters.apartment_id && item.apartment_id !== filters.apartment_id) return false;
    if (filters.tenant_id && item.tenant_id !== filters.tenant_id) return false;
    if (filters.status && item.status !== filters.status) return false;
    if (filters.period && item.period !== filters.period) return false;
    return true;
  });
}

export async function getBillById(billId: string) {
  const rows = await readRange("Bills!A2:P");
  const idx = rows.findIndex((r:any[]) => (r[0] || "") === billId);
  if (idx === -1) throw new Error("Bill not found");
  const r = rows[idx];
  return {
    id: r[0],
    apartment_id: r[1],
    bill_type: r[2],
    period: r[3],
    issue_date: r[4],
    due_date: r[5],
    amount: Number(r[6] || 0),
    balance: Number(r[7] || 0),
    status: r[8] || "",
    linked_schedule_id: r[9] || "",
    tenant_id: r[10] || "",
    tenant_name: r[11] || "",
    created_at: r[12] || "",
    notes: r[13] || "",
    invoice_id: r[14] || "",
    source: r[15] || ""
  };
}

/**
 * addBillPayment - append a BillPayments row and update bill balance/status
 */
export async function addBillPayment(data: any) {
  const paymentId = data.id || `BP_${Date.now()}`;
  const row = [
    paymentId,
    data.bill_id || "",
    data.payment_reference || `PR_${Date.now()}`,
    data.payer_tenant_id || "",
    data.payer_name || "",
    Number(data.amount || 0),
    data.method || "manual",
    data.verified ? "yes" : "no",
    data.receipt_link || "",
    new Date().toISOString(),
    data.notes || ""
  ];
  await appendRange("BillPayments!A2", [row]);

  // Update bill
  const bills = await readRange("Bills!A2:P");
  const idx = bills.findIndex((r:any[]) => (r[0] || "") === data.bill_id);
  if (idx === -1) throw new Error("Bill not found");
  const sheetRow = idx + 2;
  const currentBalance = Number(bills[idx][7] || 0);
  const newBalance = Number((currentBalance - Number(data.amount || 0)).toFixed(2));
  const newStatus = newBalance <= 0 ? "paid" : "partial";
  await batchUpdateRanges([
    { range: `Bills!H${sheetRow}`, values: [[newBalance]] },
    { range: `Bills!I${sheetRow}`, values: [[newStatus]] }
  ]);

  // Optionally add a Payments row for the payment reference if not already present
  const payments = await readRange("Payments!A2:L");
  const found = payments.find((p:any[]) => (p[1] || "") === data.payment_reference);
  if (!found) {
    const paymentRow = [
      `P_${Date.now()}`,
      data.payment_reference || `PR_${Date.now()}`,
      data.payer_tenant_id || "",
      data.payer_name || "",
      new Date().toISOString(),
      "bill",
      Number(data.amount || 0),
      data.method || "manual",
      data.verified ? "paid" : "pending",
      data.notes || "",
      new Date().toISOString(),
      data.receipt_link || ""
    ];
    await appendRange("Payments!A2", [paymentRow]);
  } else {
    // update existing
    const pIdx = payments.findIndex((p:any[]) => (p[1] || "") === data.payment_reference);
    const pRowNum = pIdx + 2;
    const updates:any[] = [];
    if (data.receipt_link) updates.push({ range: `Payments!L${pRowNum}`, values: [[data.receipt_link]] });
    if (data.verified) updates.push({ range: `Payments!I${pRowNum}`, values: [["paid"]] });
    if (updates.length) await batchUpdateRanges(updates);
  }

  return { ok: true, bill_id: data.bill_id, payment_reference: data.payment_reference || row[2], newBalance, newStatus };
}

/* --------------------------
   Utilities
   -------------------------- */
export async function getUtilities() {
  const rows = await readRange("Utilities!A2:K");
  return (rows || []).map((r:any[]) => ({
    id: r[0] || "",
    tenant_id: r[1] || "",
    month: r[2] || "",
    LAWMA: Number(r[3] || 0),
    Cleaner: Number(r[4] || 0),
    Water: Number(r[5] || 0),
    Community: Number(r[6] || 0),
    Misc: Number(r[7] || 0),
    BankCharges: Number(r[8] || 0),
    total: Number(r[9] || 0),
    created_at: r[10] || ""
  }));
}

export async function addUtility(data: any) {
  const LAWMA = Number(data.LAWMA || 0);
  const Cleaner = Number(data.Cleaner || 0);
  const Water = Number(data.Water || 0);
  const Community = Number(data.Community || 0);
  const Misc = Number(data.Misc || 0);
  const BankCharges = Number(data.BankCharges || 0);
  const total = LAWMA + Cleaner + Water + Community + Misc + BankCharges;
  const row = [
    data.id || `U_${Date.now()}`,
    data.tenant_id || "",
    data.month || "",
    LAWMA,
    Cleaner,
    Water,
    Community,
    Misc,
    BankCharges,
    total,
    data.created_at || new Date().toISOString()
  ];
  await appendRange("Utilities!A2", [row]);
  return { ...data, total, id: row[0] };
}

/* --------------------------
   Notifications & Templates
   -------------------------- */
export async function getNotifications() {
  const rows = await readRange("Notifications!A2:E");
  return rows.map((r:any[]) => ({ id: r[0] || "", type: r[1] || "", to: r[2] || "", payload: r[3] || "", status: r[4] || "" }));
}
export async function logNotification(data:any) {
  const id = `N_${Date.now()}`;
  const row = [id, data.type || "", data.to || "", JSON.stringify(data.payload || {}), data.status || "queued", new Date().toISOString()];
  await appendRange("Notifications!A2", [row]);
  return { ok: true, id };
}
export async function getTemplates() {
  const rows = await readRange("Templates!A2:D");
  return rows.map((r:any[]) => ({ id: r[0]||"", name: r[1]||"", type: r[2]||"", content: r[3]||"" }));
}
export async function addTemplate(data:any) {
  const id = data.id || `TPL_${Date.now()}`;
  const row = [id, data.name || "", data.type || "", data.content || "", new Date().toISOString()];
  await appendRange("Templates!A2", [row]);
  return { ok: true, id };
}

/* --------------------------
   Invoices & Receipts (minimal)
   -------------------------- */
export async function addInvoiceRow(data:any) {
  const id = data.id || `INV_${Date.now()}`;
  const row = [id, data.apartment_id || "", data.tenant_id || "", data.period || "", Number(data.amount||0), data.status || "issued", new Date().toISOString(), data.notes || ""];
  await appendRange("Invoices!A2", [row]);
  return { ok: true, id };
}

export async function addAgreement(data:any) {
  const id = data.id || `AG_${Date.now()}`;
  const row = [id, data.property_id || "", data.tenant_id || "", data.link || "", data.status || "active", new Date().toISOString()];
  await appendRange("Agreements!A2", [row]);
  return { ok: true, id };
}

/* --------------------------
   Rent schedule helpers
   -------------------------- */
export async function getRentSchedules() {
  const rows = await readRange("RentSchedules!A2:M");
  return rows.map((r:any[]) => ({ id: r[0]||"", apartment_id: r[1]||"", tenant_id: r[2]||"", tenant_name: r[3]||"", due_date: r[4]||"", period: r[5]||"", amount: Number(r[6]||0), status: r[7]||"", payment_reference: r[8]||"", paid_date: r[9]||"", invoice_id: r[10]||"", created_at: r[11]||"", notes: r[12]||"" }));
}

export async function markRentPaid(id: string) {
  const rows = await readRange("RentSchedules!A2:M");
  const idx = rows.findIndex((r:any[]) => (r[0]||"") === id);
  if (idx === -1) throw new Error("RentSchedule not found");
  const rowNumber = idx + 2;
  await batchUpdateRanges([{ range: `RentSchedules!G${rowNumber}`, values: [[ "paid" ]] }]);
  return { ok: true, id };
}

export async function generateMonthlyBillsForProperty(propertyId: string, period: string, dueDay = 5) {
  const apartments = await getApartments(propertyId);
  const created: any[] = [];
  for (const apt of apartments) {
    if (!apt.tenant_id) continue;
    const [yearStr, monthStr] = period.split("-");
    const y = Number(yearStr), m = Number(monthStr);
    const dueDate = new Date(y, m-1, dueDay).toISOString().split("T")[0];
    const bill = await addBill({
      apartment_id: apt.id,
      bill_type: "rent",
      period,
      issue_date: new Date().toISOString().split("T")[0],
      due_date: dueDate,
      amount: apt.rent_amount,
      balance: apt.rent_amount,
      status: "due",
      tenant_id: apt.tenant_id,
      tenant_name: apt.tenant_name || "",
      source: "auto-rent-schedule",
      notes: `Auto rent bill for ${period}`
    });
    created.push(bill);
  }
  return created;
}

/* --------------------------
   Aliases for backwards compatibility
   -------------------------- */
export { getSheets as getSheetsClient };
export { getSheets as getGoogleSheets };
export { getSheets as googleSheetsClient };

// default export small helper object if some modules import default
export default {
  getSheets,
  getDrive,
  ensureSheetTabs,
  getUserByEmail,
  addUser,
  verifyPassword,
  getTenants,
  addTenant,
  getProperties,
  addProperty,
  getApartments,
  addApartment,
  assignTenantToApartment,
  getPayments,
  recordPayment,
  recordPaymentFromPaystack,
  addReceiptLinkToPayment,
  getBills,
  addBill,
  getBillById,
  addBillPayment,
  getUtilities,
  addUtility,
  getNotifications,
  logNotification,
  getTemplates,
  addTemplate,
  addInvoiceRow,
  addAgreement,
  getRentSchedules,
  markRentPaid,
  generateMonthlyBillsForProperty,
};
