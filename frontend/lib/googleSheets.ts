// frontend/lib/googleSheets.ts
import { google } from "googleapis";
import bcrypt from "bcryptjs";

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive",
];

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
    scopes: SCOPES,
  });
}

export function getSheetsClient() {
  const auth = getAuth();
  return google.sheets({ version: "v4", auth });
}

const SHEET_ID = process.env.GOOGLE_SHEETS_ID || process.env.GOOGLE_SHEET_ID || "";

if (!SHEET_ID) {
  // don't throw at import time — let calling code fail more gracefully
  console.warn("WARNING: GOOGLE_SHEETS_ID is not set. Sheets calls will fail until set.");
}

/**
 * Ensure Users sheet exists and has header row
 */
export async function ensureUsersSheet() {
  const sheets = getSheetsClient();
  if (!SHEET_ID) throw new Error("SHEET_ID not configured");

  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const titles = (meta.data.sheets || []).map((s) => s.properties?.title);

  if (!titles.includes("Users")) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: { title: "Users", gridProperties: { rowCount: 1000, columnCount: 20 } },
            },
          },
        ],
      },
    });

    // write header row
    const headers = [
      "id",
      "email",
      "name",
      "role",
      "status",
      "password_hash",
      "uid",
      "created_at",
      "metadata",
    ];
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: "Users!A1:I1",
      valueInputOption: "RAW",
      requestBody: { values: [headers] },
    });
    return true;
  }
  return true;
}

/**
 * Read all users rows (A2..I)
 */
async function readUsersRows() {
  const sheets = getSheetsClient();
  if (!SHEET_ID) throw new Error("SHEET_ID not configured");
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Users!A2:I",
  });
  return res.data.values || [];
}

/**
 * Convert a row array to a user object consistent across code
 */
function rowToUser(r: (string | undefined)[]) {
  return {
    id: r[0] || "",
    email: r[1] || "",
    name: r[2] || "",
    role: r[3] || "tenant",
    status: r[4] || "pending",
    password_hash: r[5] || "",
    uid: r[6] || "",
    created_at: r[7] || "",
    metadata: r[8] || "",
  };
}

/**
 * getUserByEmail - returns user object or null
 */
export async function getUserByEmail(email: string) {
  await ensureUsersSheet();
  const rows = await readUsersRows();
  const idx = rows.findIndex((r) => (r[1] || "").toLowerCase() === email.toLowerCase());
  if (idx === -1) return null;
  const row = rows[idx];
  const user = rowToUser(row);
  // expose the sheet row index for updates if needed
  return { ...user, _sheetIndex: idx + 2 };
}

/**
 * addUser - appends user row (password should be plain text, will be hashed)
 * returns inserted user object
 */
export async function addUser(data: {
  id?: string;
  email: string;
  name?: string;
  role?: string;
  status?: string;
  password?: string; // plaintext
  uid?: string;
}) {
  await ensureUsersSheet();
  const sheets = getSheetsClient();
  if (!SHEET_ID) throw new Error("SHEET_ID not configured");

  const id = data.id || `u_${Date.now()}`;
  const password_hash = data.password ? await bcrypt.hash(data.password, 10) : "";
  const created_at = new Date().toISOString();
  const row = [
    id,
    data.email,
    data.name || "",
    data.role || "tenant",
    data.status || "approved",
    password_hash,
    data.uid || "",
    created_at,
    "",
  ];
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: "Users!A2:I",
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });
  return { id, email: data.email, name: data.name || "", role: data.role || "tenant", uid: data.uid || "", created_at };
}

/**
 * verifyPassword(email, plaintext) - returns true if password matches
 */
export async function verifyPassword(email: string, plaintext: string) {
  const u = await getUserByEmail(email);
  if (!u) return false;
  if (!u.password_hash) return false;
  const ok = await bcrypt.compare(plaintext, u.password_hash);
  return ok;
}

/**
 * updateUser - updates a single cell ranges by rowIndex (starting at 2) and given column/value pairs
 * data is an object mapping header to new value (e.g. { status: "approved" })
 */
export async function updateUserByRowNumber(rowNumber: number, data: Record<string, string>) {
  const sheets = getSheetsClient();
  if (!SHEET_ID) throw new Error("SHEET_ID not configured");

  // map header keys to columns (static map matching header order used earlier)
  const headerToCol: Record<string, string> = {
    id: "A",
    email: "B",
    name: "C",
    role: "D",
    status: "E",
    password_hash: "F",
    uid: "G",
    created_at: "H",
    metadata: "I",
  };

  const updates: { range: string; values: string[][] }[] = [];
  for (const key of Object.keys(data)) {
    const col = headerToCol[key];
    if (!col) continue;
    updates.push({
      range: `Users!${col}${rowNumber}`,
      values: [[data[key]]],
    });
  }

  if (updates.length === 0) return { ok: false, reason: "nothing to update" };

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { valueInputOption: "USER_ENTERED", data: updates },
  });

  return { ok: true };
}

/**
 * clearUsersSheet - deletes all rows (useful for reset seed)
 */
export async function clearUsersSheet() {
  const sheets = getSheetsClient();
  if (!SHEET_ID) throw new Error("SHEET_ID not configured");
  // Overwrite A2:I with an empty array to clear rows
  await sheets.spreadsheets.values.clear({ spreadsheetId: SHEET_ID, range: "Users!A2:I" });
  return { ok: true };
}

/* Aliases kept for backwards compatibility */
export { getSheetsClient as getSheets, getSheetsClient as googleSheets, getSheetsClient as getGoogleSheets };
