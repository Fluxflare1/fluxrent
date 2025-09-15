// scripts/seed-sheets.js
import { google } from "googleapis";

const auth = new google.auth.GoogleAuth({
  keyFile: "service-account.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

const SPREADSHEET_ID = "1amy14SwIt0zv-IPWEE9x44sw6wqTydUtqxgdz_R8ihk";

async function seedSheets() {
  try {
    // Write headers to the first row
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: "Sheet1!A1:F1",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          ["UID", "Name", "Email", "Phone", "Role", "Status"],
        ],
      },
    });

    console.log("✅ Headers created in Google Sheet");
  } catch (err) {
    console.error("❌ Error seeding sheets:", err);
  }
}

seedSheets();
