// frontend/scripts/seed-sheets.ts
import { google } from "googleapis";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";

async function seed() {
  const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
  const keyFile = path.join(process.cwd(), "service-account.json");

  if (!fs.existsSync(keyFile)) {
    console.error("❌ Missing service-account.json");
    process.exit(1);
  }

  const auth = new google.auth.GoogleAuth({
    keyFile,
    scopes: SCOPES,
  });

  const sheets = google.sheets({ version: "v4", auth });

  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!spreadsheetId) {
    console.error("❌ Missing GOOGLE_SHEET_ID env variable");
    process.exit(1);
  }

  // Seed users with different roles
  const users = [
    {
      email: "admin@yourdomain.com",
      password: await bcrypt.hash("Admin@1234", 10),
      role: "admin",
      uid: "U1",
    },
    {
      email: "propertyadmin@yourdomain.com",
      password: await bcrypt.hash("PropertyAdmin@1234", 10),
      role: "property_admin",
      uid: "U2",
    },
    {
      email: "tenant@yourdomain.com",
      password: await bcrypt.hash("Tenant@1234", 10),
      role: "tenant",
      uid: "U3",
    },
  ];

  // Write headers + users into the "Users" sheet
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "Users!A1:D1",
    valueInputOption: "RAW",
    requestBody: {
      values: [["Email", "Password", "Role", "UID"]],
    },
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "Users!A2",
    valueInputOption: "RAW",
    requestBody: {
      values: users.map((u) => [u.email, u.password, u.role, u.uid]),
    },
  });

  console.log("✅ Seeded users into Google Sheet:", users.map((u) => u.email));
}

seed().catch((err) => {
  console.error("❌ Error seeding data:", err);
  process.exit(1);
});
