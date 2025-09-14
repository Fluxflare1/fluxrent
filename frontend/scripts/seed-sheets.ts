import bcrypt from "bcryptjs";
import { addUser } from "../lib/googleSheets";

async function seedAdmin() {
  const hash = await bcrypt.hash("admin123", 10); // Default password
  await addUser({
    id: "1",
    email: "admin@example.com",
    name: "Super Admin",
    role: "admin",
    status: "approved",
    password_hash: hash,
    uid: "ADM/001",
  });
  console.log("✅ Admin user seeded");
}

seedAdmin();



// frontend/scripts/seed-sheets.ts
import { getSheetsClient } from "../lib/googleSheets";

const SHEET_ID = process.env.GOOGLE_SHEETS_ID || "";

async function main() {
  const sheets = getSheetsClient();

  const requests = [
    {
      addSheet: { properties: { title: "Properties", gridProperties: { rowCount: 100, columnCount: 5 } } },
    },
    {
      addSheet: { properties: { title: "Tenants", gridProperties: { rowCount: 100, columnCount: 6 } } },
    },
    {
      addSheet: { properties: { title: "Payments", gridProperties: { rowCount: 100, columnCount: 6 } } },
    },
    {
      addSheet: { properties: { title: "Notifications", gridProperties: { rowCount: 100, columnCount: 4 } } },
    },
  ];

  await sheets.spreadsheets.batchUpdate({ spreadsheetId: SHEET_ID, requestBody: { requests } });

  console.log("✅ Sheets created successfully!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
