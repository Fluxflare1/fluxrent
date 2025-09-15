import { google } from "googleapis";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Setup __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to your service account credentials
const KEYFILEPATH = path.join(__dirname, "../service-account.json");

// Scopes for Google Sheets API
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

// Load client secrets
const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

// Spreadsheet ID (replace with yours)
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID";

async function seedSheets() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  // Example: Add headers to "Tenants" sheet
  const requests = [
    {
      updateCells: {
        start: { sheetId: 0, rowIndex: 0, columnIndex: 0 },
        rows: [
          {
            values: [
              { userEnteredValue: { stringValue: "Tenant ID" } },
              { userEnteredValue: { stringValue: "Name" } },
              { userEnteredValue: { stringValue: "Email" } },
              { userEnteredValue: { stringValue: "Phone" } },
              { userEnteredValue: { stringValue: "Unit" } },
            ],
          },
        ],
        fields: "userEnteredValue",
      },
    },
  ];

  try {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { requests },
    });
    console.log("✅ Sheets seeded successfully with headers!");
  } catch (err) {
    console.error("❌ Error seeding sheets:", err);
  }
}

seedSheets();
