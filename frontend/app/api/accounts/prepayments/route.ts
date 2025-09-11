import { NextResponse } from "next/server";
import { getGoogleSheets } from "@/lib/googleSheets";

export async function GET() {
  try {
    const sheets = await getGoogleSheets();
    const prepaymentsSheet = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID!,
      range: "Prepayments!A2:H",
    });

    const rows = prepaymentsSheet.data.values || [];
    const data = rows.map((r, idx) => ({
      id: r[0],
      tenant_id: r[1],
      tenant_name: r[2],
      apartment: r[3],
      amount: parseFloat(r[4] || "0"),
      allocated_amount: parseFloat(r[5] || "0"),
      balance: parseFloat(r[6] || "0"),
      created_at: r[7],
    }));

    return NextResponse.json(data);
  } catch (err) {
    console.error("Error loading prepayments:", err);
    return NextResponse.json({ error: "Failed to load prepayments" }, { status: 500 });
  }
}
