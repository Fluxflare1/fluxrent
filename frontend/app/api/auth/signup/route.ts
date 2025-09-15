import { NextResponse } from "next/server";
import { google } from "googleapis";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Handle ESM paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KEYFILEPATH = path.join(process.cwd(), "service-account.json");
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

// Replace with your real spreadsheet ID
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, role = "pending" } = body;

    const auth = new google.auth.GoogleAuth({
      keyFile: KEYFILEPATH,
      scopes: SCOPES,
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    // Append the new signup request
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Users!A:D", // assuming sheet named "Users"
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[Date.now(), name, email, role]],
      },
    });

    return NextResponse.json({ success: true, message: "Signup request saved" });
  } catch (err: any) {
    console.error("Error saving signup:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
