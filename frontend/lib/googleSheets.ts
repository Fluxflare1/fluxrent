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
   USERS
   ------------------------- */
export async function getUsers() {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Users!A2:H",
  });
  return res.data.values || [];
}

export async function addUser(user: any) {
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: "Users!A:H",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        user.id,
        user.email,
        user.name,
        user.role,
        user.status,
        user.password_hash,
        user.uid,
        new Date().toISOString(),
      ]],
    },
  });
  return { ok: true, user };
}

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
