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

export function getDriveClient() {
  const auth = getAuth();
  return google.drive({ version: "v3", auth });
}

const SHEET_ID = process.env.GOOGLE_SHEETS_ID || "";
const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || "";

/* -------------------------
   PROPERTIES
   ------------------------- */
export async function getProperties() {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Properties!A2:E",
  });
  return res.data.values || [];
}

export async function addProperty(data: any) {
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: "Properties!A:E",
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [[data.id, data.name, data.address, data.managerId, data.status]] },
  });
  return { ok: true, data };
}

/* -------------------------
   TENANTS
   ------------------------- */
export async function getTenants() {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Tenants!A2:F",
  });
  return res.data.values || [];
}

export async function addTenant(data: any) {
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: "Tenants!A:F",
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [[data.id, data.name, data.email, data.phone, data.unitId, data.status]] },
  });
  return { ok: true, data };
}

/* -------------------------
   PAYMENTS
   ------------------------- */
export async function recordPayment(data: any) {
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: "Payments!A:F",
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [[data.id, data.tenantId, data.amount, data.date, data.method, data.ref]] },
  });
  return { ok: true, data };
}

/* -------------------------
   RECEIPTS (Drive Integration)
   ------------------------- */
export async function uploadReceipt(fileName: string, mimeType: string, buffer: Buffer) {
  const drive = getDriveClient();
  const res = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [DRIVE_FOLDER_ID],
    },
    media: { mimeType, body: buffer },
    fields: "id, webViewLink",
  });
  return res.data;
}

/* -------------------------
   NOTIFICATIONS (log to sheet)
   ------------------------- */
export async function logNotification(data: any) {
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: "Notifications!A:D",
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [[data.id, data.userId, data.message, new Date().toISOString()]] },
  });
  return { ok: true, data };
}
