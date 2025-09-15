import { google } from "googleapis";

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

export const sheets = google.sheets({ version: "v4", auth });

// === Mock implementations for now ===
// Replace with real spreadsheet logic later

export async function getProperties() { return []; }
export async function addProperty(data: any) { return { success: true, data }; }

export async function getApartments() { return []; }
export async function addApartment(data: any) { return { success: true, data }; }
export async function assignTenantToApartment(data: any) { return { success: true, data }; }

export async function getBills() { return []; }
export async function addBill(data: any) { return { success: true, data }; }
export async function getBillById(id: string) { return null; }
export async function addBillPayment(data: any) { return { success: true, data }; }

export async function getRentSchedules() { return []; }
export async function markRentPaid(id: string) { return { success: true, id }; }
export async function generateMonthlyBillsForProperty(propertyId: string) { return { success: true, propertyId }; }

export async function addInvoiceRow(data: any) { return { success: true, data }; }
export async function addReceiptLinkToPayment(paymentId: string, link: string) { return { success: true, paymentId, link }; }

export async function getNotifications() { return []; }
export async function logNotification(data: any) { return { success: true, data }; }

export async function recordPaymentFromPaystack(data: any) { return { success: true, data }; }

export async function getUtilities() { return []; }
export async function addUtility(data: any) { return { success: true, data }; }

export async function getTemplates() { return []; }
export async function addTemplate(data: any) { return { success: true, data }; }

export async function addAgreement(data: any) { return { success: true, data }; }
export async function updateTenantKyc(data: any) { return { success: true, data }; }
