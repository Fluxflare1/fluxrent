import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const spreadsheetId = process.env.GOOGLE_SHEET_ID!; // put your Sheet ID in .env

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: SCOPES,
  });
}

export async function getSheets() {
  const auth = await getAuth();
  return google.sheets({ version: "v4", auth });
}

export async function ensureSheetTabs() {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.get({ spreadsheetId });
  const existing = res.data.sheets?.map((s) => s.properties?.title) || [];

  const requiredTabs = {
    Invoices: ["id", "apartment_id", "tenant_id", "period", "amount", "status", "created_at"],
    Payments: ["id", "invoice_id", "tenant_id", "tenant_name", "amount", "method", "ref", "status", "notes", "created_at", "receipt_link"],
    Receipts: ["id", "payment_ref", "tenant_name", "amount", "date", "method", "notes", "receipt_link"],
  };

  for (const [tab, headers] of Object.entries(requiredTabs)) {
    if (!existing.includes(tab)) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{ addSheet: { properties: { title: tab } } }],
        },
      });
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${tab}!A1:${String.fromCharCode(65 + headers.length - 1)}1`,
        valueInputOption: "RAW",
        requestBody: { values: [headers] },
      });
    }
  }
}
