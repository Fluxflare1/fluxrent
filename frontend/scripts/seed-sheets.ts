// frontend/scripts/seed-sheets.ts
import bcrypt from "bcryptjs";
import { getSheetsClient, addUser } from "../lib/googleSheets";

const SHEET_ID = process.env.GOOGLE_SHEETS_ID || process.env.GOOGLE_SHEET_ID || "";

async function createSheetIfMissing(sheets: any, title: string, headers: string[]) {
  // try to add sheet; ignore error if already exists
  try {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title,
                gridProperties: { rowCount: 500, columnCount: headers.length },
              },
            },
          },
        ],
      },
    });
    console.log(`Created sheet: ${title}`);
  } catch (err: any) {
    if (err?.message?.includes("already exists")) {
      console.log(`Sheet ${title} exists - skipping creation`);
    } else {
      // continue; some APIs return other messages
    }
  }

  // set headers in row 1 (idempotent)
  try {
    const endCol = String.fromCharCode(65 + headers.length - 1);
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${title}!A1:${endCol}1`,
      valueInputOption: "RAW",
      requestBody: { values: [headers] },
    });
    console.log(`Set headers for ${title}`);
  } catch (err) {
    console.error("Failed to set headers", err);
  }
}

async function seedAdmin() {
  const hash = await bcrypt.hash("Admin@1234", 10); // change default password after first login
  await addUser({
    id: "usr_1",
    email: "admin@yourdomain.com",
    name: "Platform Admin",
    role: "admin",
    status: "approved",
    password_hash: hash,
    uid: "ADM/0001",
    created_at: new Date().toISOString(),
  });
  console.log("✅ Admin user seeded (email: admin@yourdomain.com, password: Admin@1234)");
}

async function main() {
  const sheets = getSheetsClient();
  const definitions: { title: string; headers: string[] }[] = [
    {
      title: "Users",
      headers: ["id", "email", "name", "role", "status", "password_hash", "uid", "created_at"],
    },
    { title: "Properties", headers: ["id", "name", "address", "managerId", "status", "created_at"] },
    { title: "Tenants", headers: ["id", "name", "email", "phone", "unitId", "status", "created_at"] },
    { title: "Payments", headers: ["id", "payment_reference", "tenant_id", "tenant_name", "date", "type", "amount", "method", "status", "notes", "created_at", "receipt_link"] },
    { title: "Notifications", headers: ["id", "userId", "message", "timestamp"] },
  ];

  for (const def of definitions) {
    await createSheetIfMissing(sheets, def.title, def.headers);
  }

  await seedAdmin();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
