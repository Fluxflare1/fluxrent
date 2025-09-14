// frontend/scripts/seed-sheets.ts
import bcrypt from "bcryptjs";
import { getSheetsClient, addUser } from "../lib/googleSheets";

const SHEET_ID = process.env.GOOGLE_SHEETS_ID || "";

async function createSheets() {
  const sheets = getSheetsClient();

  const sheetDefinitions = [
    {
      title: "Users",
      headers: ["id", "email", "name", "role", "status", "password_hash", "uid", "created_at"],
    },
    {
      title: "Properties",
      headers: ["id", "name", "address", "managerId", "status"],
    },
    {
      title: "Tenants",
      headers: ["id", "name", "email", "phone", "unitId", "status"],
    },
    {
      title: "Payments",
      headers: ["id", "tenantId", "amount", "date", "method", "ref"],
    },
    {
      title: "Notifications",
      headers: ["id", "userId", "message", "timestamp"],
    },
  ];

  for (const sheet of sheetDefinitions) {
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheet.title,
                  gridProperties: { rowCount: 100, columnCount: sheet.headers.length },
                },
              },
            },
          ],
        },
      });

      // Insert headers in row 1
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${sheet.title}!A1:${String.fromCharCode(65 + sheet.headers.length - 1)}1`,
        valueInputOption: "RAW",
        requestBody: {
          values: [sheet.headers],
        },
      });

      console.log(`✅ Created sheet: ${sheet.title} with headers`);
    } catch (err: any) {
      if (err.message.includes("already exists")) {
        console.log(`ℹ️ Sheet '${sheet.title}' already exists, skipping...`);
      } else {
        throw err;
      }
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
