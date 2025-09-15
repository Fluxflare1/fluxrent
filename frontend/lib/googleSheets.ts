// frontend/lib/googleSheets.ts
import { google } from "googleapis";
import bcrypt from "bcryptjs";

const SHEET_ID = process.env.GOOGLE_SHEETS_ID || process.env.GOOGLE_SHEET_ID || "";
if (!SHEET_ID) {
  // don't throw here to allow dev flows, but warn
  console.warn("Warning: GOOGLE_SHEETS_ID is not set in env.");
}

function getAuth() {
  const credentials = {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  };
  if (!credentials.client_email || !credentials.private_key) {
    throw new Error("Google credentials not set in environment variables (GOOGLE_CLIENT_EMAIL / GOOGLE_PRIVATE_KEY).");
  }
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"],
  });
}

export function getSheetsClient() {
  const auth = getAuth();
  return google.sheets({ version: "v4", auth });
}

/**
 * Users sheet is expected to exist with headers in row 1:
 * id | email | name | password_hash | role | status | created_at
 */
const USERS_RANGE = "Users!A2:G"; // read (starting row 2)

export type UserRow = {
  id: string;
  email: string;
  name?: string;
  password_hash?: string;
  role?: string;
  status?: string;
  created_at?: string;
};

export async function getAllUsers(): Promise<UserRow[]> {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: USERS_RANGE,
  });
  const rows = res.data.values || [];
  return rows.map((r: any[]) => ({
    id: r[0] || "",
    email: (r[1] || "").toLowerCase(),
    name: r[2] || "",
    password_hash: r[3] || "",
    role: r[4] || "tenant",
    status: r[5] || "approved",
    created_at: r[6] || "",
  }));
}

export async function getUserByEmail(email: string): Promise<UserRow | null> {
  if (!email) return null;
  const all = await getAllUsers();
  const found = all.find((u) => u.email === email.toLowerCase());
  return found || null;
}

export async function getUserById(id: string): Promise<UserRow | null> {
  if (!id) return null;
  const all = await getAllUsers();
  const found = all.find((u) => u.id === id);
  return found || null;
}

export async function verifyPassword(email: string, password: string): Promise<UserRow | null> {
  const user = await getUserByEmail(email);
  if (!user || !user.password_hash) return null;
  const ok = await bcrypt.compare(password, user.password_hash);
  return ok ? user : null;
}

export async function upsertUser(user: Partial<UserRow>) {
  // simple append for now (production you may want to find & update)
  const sheets = getSheetsClient();
  const id = user.id || `u_${Date.now()}`;
  const row = [
    id,
    (user.email || "").toLowerCase(),
    user.name || "",
    user.password_hash || "",
    user.role || "tenant",
    user.status || "approved",
    user.created_at || new Date().toISOString(),
  ];
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: "Users!A:G",
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });
  return { id, ...user };
}

export default {
  getSheetsClient,
  getAllUsers,
  getUserByEmail,
  getUserById,
  verifyPassword,
  upsertUser,
};
