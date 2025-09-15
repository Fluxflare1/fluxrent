// frontend/scripts/seed-sheets.ts
/**
 * Run: npx ts-node scripts/seed-sheets.ts
 *
 * This script will:
 *  - ensure Users sheet has the correct headers
 *  - insert three test users (admin, property_admin, tenant) replacing if email already exists
 *
 * Requires env:
 *  - GOOGLE_CLIENT_EMAIL
 *  - GOOGLE_PRIVATE_KEY (one-line with \n or multiline)
 *  - GOOGLE_SHEETS_ID
 *
 */

import { google } from "googleapis";
import bcrypt from "bcryptjs";

const SHEET_ID = process.env.GOOGLE_SHEETS_ID || process.env.GOOGLE_SHEET_ID || "";
if (!SHEET_ID) {
  console.error("Please set GOOGLE_SHEETS_ID in env.");
  process.exit(1);
}

function getAuth() {
  const credentials = {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  };
  if (!credentials.client_email || !credentials.private_key) {
    console.error("Please set GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY in env.");
    process.exit(1);
  }
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

async function main() {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  // Ensure Users header
  const headerRange = "Users!A1:G1";
  const headerRow = [["id", "email", "name", "password_hash", "role", "status", "created_at"]];
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: headerRange,
    valueInputOption: "RAW",
    requestBody: { values: headerRow },
  });
  console.log("✅ Ensured Users headers.");

  // Fetch existing users
  const existingRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Users!A2:G",
  });
  const rows = existingRes.data.values || [];

  // Helper to upsert by email
  async function upsertUser(email: string, name: string, role: string, password: string) {
    const idx = rows.findIndex((r: any[]) => (r[1] || "").toLowerCase() === email.toLowerCase());
    const hash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();
    if (idx !== -1) {
      const rowNumber = idx + 2;
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Users!A${rowNumber}:G${rowNumber}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[`u_${Date.now()}`, email.toLowerCase(), name, hash, role, "approved", now]],
        },
      });
      console.log(`Updated user ${email}`);
    } else {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: "Users!A:G",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[`u_${Date.now()}`, email.toLowerCase(), name, hash, role, "approved", now]],
        },
      });
      console.log(`Inserted user ${email}`);
    }
  }

  // Create three users (passwords: Admin@123, Manager@123, Tenant@123)
  await upsertUser("admin@example.com", "Platform Admin", "admin", "Admin@123");
  await upsertUser("manager@example.com", "Property Manager", "property_admin", "Manager@123");
  await upsertUser("tenant@example.com", "Tenant User", "tenant", "Tenant@123");

  console.log("✅ Seed complete. Test login credentials:");
  console.log(" - admin@example.com / Admin@123");
  console.log(" - manager@example.com / Manager@123");
  console.log(" - tenant@example.com / Tenant@123");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
