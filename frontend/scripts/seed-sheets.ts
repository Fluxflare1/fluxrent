/**
 * Script to seed Google Sheets with required headers
 *
 * Usage:
 *   npx ts-node scripts/seed-sheets.ts
 */

import { google } from "googleapis";
import path from "path";
import fs from "fs";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const KEYFILE = path.join(process.cwd(), "credentials.json"); // Service Account JSON

// Replace with your Google Sheet IDs
const SHEETS = {
  users: "YOUR_USERS_SHEET_ID",
  tenants: "YOUR_TENANTS_SHEET_ID",
  properties: "YOUR_PROPERTIES_SHEET_ID",
};

// Define headers for each sheet
const HEADERS: Record<string, string[]> = {
  users: ["id", "name", "email", "password", "role", "createdAt"],
  tenants: ["id", "name", "email", "phone", "propertyId", "leaseStart", "leaseEnd"],
  properties: ["id", "name", "address", "units", "managerId"],
};

async function seed() {
  // Load Google Auth
  const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILE,
    scopes: SCOPES,
  });

  const sheets = google.sheets({ version: "v4", auth });

  for (const [sheetName, spreadsheetId] of Object.entries(SHEETS)) {
    console.log(`Seeding sheet: ${sheetName} (${spreadsheetId})`);

    // Clear sheet first
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
    });

    // Insert headers
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: "RAW",
      requestBody: {
        values: [HEADERS[sheetName]],
      },
    });

    console.log(`✅ ${sheetName} sheet seeded with headers.`);
  }
}

seed().catch((err) => {
  console.error("❌ Error seeding sheets:", err);
  process.exit(1);
});
