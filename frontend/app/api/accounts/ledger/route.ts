import { NextResponse } from "next/server";
import { googleSheets } from "@/lib/googleSheets";

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // tenant|apartment|property|general
    const id = searchParams.get("id");

    const sheets = await googleSheets();
    const range = "Ledger!A:F"; // Columns: ID | Type | Ref | Debit | Credit | Date
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range,
    });

    const rows = res.data.values || [];
    let data = rows.slice(1).map((r) => ({
      id: r[0],
      type: r[1],
      ref: r[2],
      debit: parseFloat(r[3] || "0"),
      credit: parseFloat(r[4] || "0"),
      date: r[5],
    }));

    if (type && id) {
      data = data.filter((d) => d.type === type && d.ref === id);
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, ref, debit, credit } = body;

    const sheets = await googleSheets();
    const row = [
      `TXN-${Date.now()}`,
      type,
      ref,
      debit || 0,
      credit || 0,
      new Date().toISOString(),
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Ledger!A:F",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [row] },
    });

    return NextResponse.json({ success: true, transaction: row });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
