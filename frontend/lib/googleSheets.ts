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

/* --------------------------
   Payments
   -------------------------- */
export async function getPayments() { /* ... */ }
export async function recordPayment(data: any) { /* ... */ }
export async function recordPaymentFromPaystack(data: any) { /* ... */ }

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
   Bills
   -------------------------- */
export async function getBillById(id: string) { /* ... */ }
export async function addBillPayment(data: any) { /* ... */ }

/* --------------------------
   Invoices
   -------------------------- */
export async function addInvoiceRow(data: any) { /* ... */ }

/* --------------------------
   Agreements
   -------------------------- */
export async function addAgreement(data: any) { /* ... */ }

/* --------------------------
   Aliases (backward compatibility)
   -------------------------- */
export { getSheetsClient as getGoogleSheets };
export { getSheetsClient as googleSheets };
export { getSheetsClient as getSheets };
