// frontend/lib/googleSheets.ts
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

export function getSheetsClient() {
  const auth = getAuth();
  return google.sheets({ version: "v4", auth });
}

const SHEET_ID = process.env.GOOGLE_SHEETS_ID || "";

/* -------------------------
   PROPERTIES
   ------------------------- */
export async function getProperties() { return []; }
export async function addProperty(data: any) { return { ok: true, data }; }

/* -------------------------
   APARTMENTS
   ------------------------- */
export async function getApartments() { return []; }
export async function addApartment(data: any) { return { ok: true, data }; }
export async function assignTenantToApartment(apartmentId: string, tenantId: string) {
  return { ok: true, apartmentId, tenantId };
}

/* -------------------------
   TENANTS
   ------------------------- */
export async function getTenants() { return []; }
export async function updateTenantKyc(tenantId: string, kycData: any) {
  return { ok: true, tenantId, kycData };
}

/* -------------------------
   AGREEMENTS
   ------------------------- */
export async function addAgreement(data: any) { return { ok: true, data }; }

/* -------------------------
   BILLS
   ------------------------- */
export async function getBills() { return []; }
export async function addBill(data: any) { return { ok: true, data }; }
export async function getBillById(id: string) { return { id, amount: 0 }; }
export async function addBillPayment(data: any) { return { ok: true, data }; }

/* -------------------------
   PAYMENTS
   ------------------------- */
export async function getPayments() { return []; }
export async function recordPayment(data: any) { return { ok: true, data }; }
export async function recordPaymentFromPaystack(data: any) {
  return { ok: true, data };
}

/* -------------------------
   INVOICES
   ------------------------- */
export async function addInvoiceRow(data: any) { return { ok: true, data }; }

/* -------------------------
   RECEIPTS
   ------------------------- */
export async function addReceiptLinkToPayment(ref: string, link: string) {
  return { ok: true, ref, link };
}

/* -------------------------
   RENT SCHEDULES
   ------------------------- */
export async function getRentSchedules() { return []; }
export async function markRentPaid(id: string) { return { ok: true, id }; }
export async function generateMonthlyBillsForProperty(propertyId: string) {
  return { ok: true, propertyId };
}

/* -------------------------
   NOTIFICATIONS
   ------------------------- */
export async function getNotifications() { return []; }
export async function logNotification(data: any) { return { ok: true, data }; }

/* -------------------------
   UTILITIES
   ------------------------- */
export async function getUtilities() { return []; }
export async function addUtility(data: any) { return { ok: true, data }; }

/* -------------------------
   TEMPLATES
   ------------------------- */
export async function getTemplates() { return []; }
export async function addTemplate(data: any) { return { ok: true, data }; }

/* -------------------------
   ALIASES (for backwards compatibility)
   ------------------------- */
export { getSheetsClient as getSheets };
export { getSheetsClient as googleSheets };
export { getSheetsClient as getGoogleSheets };
