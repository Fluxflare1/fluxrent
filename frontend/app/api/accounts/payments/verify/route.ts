import { NextResponse } from "next/server";
import { getGoogleSheets } from "@/lib/googleSheets";

export async function POST(req: Request) {
  try {
    const { payment_id } = await req.json();
    const sheets = await getGoogleSheets();

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID!,
      range: "Payments!A2:J",
    });

    const rows = res.data.values || [];
    const idx = rows.findIndex((r) => r[0] === payment_id);
    if (idx === -1) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

    rows[idx][8] = "VERIFIED";

    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.SHEET_ID!,
      range: `Payments!A${idx + 2}:J${idx + 2}`,
      valueInputOption: "RAW",
      requestBody: { values: [rows[idx]] },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error verifying payment:", err);
    return NextResponse.json({ error: "Failed to verify" }, { status: 500 });
  }
}
