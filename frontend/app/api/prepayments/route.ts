import { NextResponse } from "next/server";
import { googleSheets } from "@/lib/googleSheets";

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;

export async function POST(req: Request) {
  try {
    const { tenant_id, tenant_name, apartment_id, amount, notes } =
      await req.json();

    const sheets = await googleSheets();
    const row = [
      `PRE-${Date.now()}`,
      tenant_id,
      tenant_name,
      apartment_id,
      amount,
      amount, // remaining = full amount initially
      new Date().toISOString(),
      notes || "",
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Prepayments!A:H",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [row] },
    });

    return NextResponse.json({ success: true, row });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenant_id = searchParams.get("tenant_id");

    const sheets = await googleSheets();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Prepayments!A:H",
    });

    const rows = res.data.values || [];
    let data = rows.slice(1).map((r) => ({
      id: r[0],
      tenant_id: r[1],
      tenant_name: r[2],
      apartment_id: r[3],
      amount: parseFloat(r[4] || "0"),
      remaining: parseFloat(r[5] || "0"),
      created_at: r[6],
      notes: r[7],
    }));

    if (tenant_id) {
      data = data.filter((d) => d.tenant_id === tenant_id);
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
