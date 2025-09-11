import { NextResponse } from "next/server";
import { googleSheets } from "@/lib/googleSheets";

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;

export async function GET() {
  try {
    const sheets = await googleSheets();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Cashbook!A:E", // Columns: ID | Desc | Debit | Credit | Date
    });
    const rows = res.data.values || [];
    const data = rows.slice(1).map((r) => ({
      id: r[0],
      desc: r[1],
      debit: parseFloat(r[2] || "0"),
      credit: parseFloat(r[3] || "0"),
      date: r[4],
    }));
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { desc, debit, credit } = await req.json();
    const row = [
      `CB-${Date.now()}`,
      desc,
      debit || 0,
      credit || 0,
      new Date().toISOString(),
    ];
    const sheets = await googleSheets();
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Cashbook!A:E",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [row] },
    });
    return NextResponse.json({ success: true, row });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
