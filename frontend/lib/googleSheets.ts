import { google } from "googleapis";

function getAuth() {
  const credentials = {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  };
  if (!credentials.client_email || !credentials.private_key) {
    throw new Error("Google credentials not set in environment variables.");
  }
  return new google.auth.GoogleAuth({
    credentials,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive",
    ],
  });
}

function getSheetsClient() {
  const auth = getAuth();
  return google.sheets({ version: "v4", auth });
}

const SHEET_ID = process.env.GOOGLE_SHEETS_ID || "";

/* --------------------------
   Utility bootstrap
   -------------------------- */
export async function ensureSheetTabs() {
  // TODO: add logic to create missing tabs
  return true;
}

/* --------------------------
   Tenants
   -------------------------- */
export async function getTenants() { /* ... same as yours ... */ }
export async function addTenant(data: any) { /* ... same as yours ... */ }
export async function updateTenantKyc(tenantId: string, kycLink: string) { /* ... same as yours ... */ }

/* --------------------------
   Payments
   -------------------------- */
export async function getPayments() { /* ... same as yours ... */ }
export async function recordPayment(data: any) { /* ... same as yours ... */ }
export async function recordPaymentFromPaystack(data: any) { /* ... same as yours ... */ }

export async function addReceiptLinkToPayment(ref: string, link: string) {
  const sheets = getSheetsClient();
  const rows = (
    await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Payments!A2:L",
    })
  ).data.values || [];
  const idx = rows.findIndex((r) => (r[1] || "") === ref);
  if (idx === -1) throw new Error("Payment not found");
  const rowNumber = idx + 2;
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `Payments!L${rowNumber}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [[link]] },
  });
  return { ok: true, ref, link };
}

/* --------------------------
   Utilities
   -------------------------- */
export async function getUtilities() { /* ... same as yours ... */ }
export async function addUtility(data: any) { /* ... same as yours ... */ }

/* --------------------------
   Properties & Apartments
   -------------------------- */
export async function addProperty(data: any) { /* ... same as yours ... */ }
export async function getProperties() { /* ... same as yours ... */ }
export async function addApartment(data: any) { /* ... same as yours ... */ }
export async function getApartments(propertyId?: string) { /* ... same as yours ... */ }
export async function assignTenantToApartment(apartmentId: string, tenantId: string, tenantName: string, leaseStart?: string, leaseEnd?: string) { /* ... same as yours ... */ }

/* --------------------------
   Bills & RentSchedules
   -------------------------- */
export async function addRentScheduleRow(data: any) { /* ... same as yours ... */ }
export async function addBill(data: any) { /* ... same as yours ... */ }
export async function getBills(filters: any = {}) { /* ... same as yours ... */ }
export async function getBillById(billId: string) { /* ... same as yours ... */ }
export async function addBillPayment(data: any) { /* ... same as yours ... */ }
export async function generateMonthlyBillsForProperty(propertyId: string, period: string, dueDay: number = 5) { /* ... same as yours ... */ }

/* --------------------------
   Notifications & Templates (stubs)
   -------------------------- */
export async function getNotifications() {
  return [];
}
export async function logNotification(data: any) {
  return { ok: true, data };
}
export async function getRentSchedules() {
  return [];
}
export async function markRentPaid(id: string) {
  return { ok: true, id };
}
export async function addTemplate(data: any) {
  return { ok: true, data };
}
export async function getTemplates() {
  return [];
}
