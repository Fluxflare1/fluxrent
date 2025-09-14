// frontend/scripts/seed-sheets.ts
import bcrypt from "bcryptjs";
import { getSheetsClient, addUser } from "../lib/googleSheets";

const SHEET_ID = process.env.GOOGLE_SHEETS_ID || "";

async function createSheets() {
  const sheets = getSheetsClient();

  const requests = [
    { addSheet: { properties: { title: "Users", gridProperties: { rowCount: 100, columnCount: 8 } } } },
    { addSheet: { properties: { title: "Properties", gridProperties: { rowCount: 100, columnCount: 5 } } } },
    { addSheet: { properties: { title: "Tenants", gridProperties: { rowCount: 100, columnCount: 6 } } } },
    { addSheet: { properties: { title: "Payments", gridProperties: { rowCount: 100, columnCount: 6 } } } },
    { addSheet: { properties: { title: "Notifications", gridProperties: { rowCount: 100, columnCount: 4 } } } },
  ];

  try {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: { requests },
    });
    console.log("✅ Sheets created successfully!");
  } catch (err: any) {
    if (err.message.includes("already exists")) {
      console.log("ℹ️ Sheets already exist, skipping creation.");
    } else {
      throw err;
    }
  }
}

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

async function main() {
  await createSheets();
  await seedAdmin();
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
