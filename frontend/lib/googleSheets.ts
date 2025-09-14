// frontend/lib/googleSheets.ts
import { google } from "googleapis";
import bcrypt from "bcryptjs";

const SHEET_ID = process.env.GOOGLE_SHEETS_ID || process.env.GOOGLE_SHEET_ID || "";

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

/* -------------------------
   Users helpers (for Auth)
   ------------------------- */

/**
 * getUserByEmail - reads Users sheet and returns first matching user object
 * Expected Users headers row (A1...): id,email,name,role,status,password_hash,uid,created_at
 */
export async function getUserByEmail(email: string) {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Users!A2:H",
  });
  const rows = res.data.values || [];
  for (const r of rows) {
    const [id, rowEmail, name, role, status, password_hash, uid, created_at] = r;
    if ((rowEmail || "").toLowerCase() === (email || "").toLowerCase()) {
      return {
        id: id || null,
        email: rowEmail || null,
        name: name || null,
        role: role || null,
        status: status || null,
        password_hash: password_hash || null,
        uid: uid || null,
        created_at: created_at || null,
      };
    }
  }
  return null;
}

/**
 * addUser - append a user row into Users sheet
 * user = { id, email, name, role, status, password_hash, uid, created_at }
 */
export async function addUser(user: {
  id: string;
  email: string;
  name?: string;
  role?: string;
  status?: string;
  password_hash?: string;
  uid?: string;
  created_at?: string;
}) {
  const sheets = getSheetsClient();
  const row = [
    user.id,
    user.email,
    user.name || "",
    user.role || "tenant",
    user.status || "pending",
    user.password_hash || "",
    user.uid || "",
    user.created_at || new Date().toISOString(),
  ];
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: "Users!A2",
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });
  return { ok: true, id: row[0] };
}

/** verifyPassword - compare plaintext with the stored hash */
export async function verifyPassword(plain: string, hash: string) {
  if (!hash) return false;
  return bcrypt.compare(plain, hash);
}

/* -------------------------
   Small helpers for other modules (stubs + simple implementations)
   Replace/extend these later with full business rules
   ------------------------- */

export async function getTenants() {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Tenants!A2:L",
  });
  return res.data.values || [];
}

export async function getPayments() {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Payments!A2:L",
  });
  return res.data.values || [];
}

/* lightweight addPayment function */
export async function recordPayment(data: any) {
  const sheets = getSheetsClient();
  const row = [
    data.id || `p_${Date.now()}`,
    data.payment_reference || data.id || "",
    data.tenant_id || "",
    data.tenant_name || "",
    data.date || new Date().toISOString(),
    data.type || "rent",
    data.amount || "",
    data.method || "manual",
    data.status || "paid",
    data.notes || "",
    new Date().toISOString(),
    data.receipt_link || "",
  ];
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: "Payments!A2",
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });
  return row;
}

/* addReceiptLinkToPayment */
export async function addReceiptLinkToPayment(ref: string, link: string) {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Payments!A2:L",
  });
  const rows = res.data.values || [];
  const idx = rows.findIndex((r: any[]) => (r[1] || "") === ref);
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

/* exports for backwards compatibility */
export { getSheetsClient as getSheets };
export { getSheetsClient as googleSheets };
export { getSheetsClient as getGoogleSheets };
