import { NextResponse } from "next/server";
import { getGoogleSheets } from "@/lib/googleSheets";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const { tenant_id, tenant_name, apartment, invoice_id, amount, method, ref, verified } =
      await req.json();

    const sheets = await getGoogleSheets();

    const newPayment = [
      uuidv4(),
      tenant_id,
      tenant_name,
      apartment,
      invoice_id,
      amount,
      method,
      ref || "",
      verified ? "VERIFIED" : "PENDING",
      new Date().toISOString(),
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SHEET_ID!,
      range: "Payments!A:J",
      valueInputOption: "RAW",
      requestBody: { values: [newPayment] },
    });

    return NextResponse.json({ success: true, payment: newPayment });
  } catch (err) {
    console.error("Error recording payment:", err);
    return NextResponse.json({ error: "Failed to record payment" }, { status: 500 });
  }
}



import { NextResponse } from "next/server";
import { getSheets, ensureSheetTabs } from "@/app/lib/googleSheets";

const spreadsheetId = process.env.GOOGLE_SHEET_ID!;

export async function GET() {
  try {
    const sheets = await getSheets();
    await ensureSheetTabs();

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Payments!A2:Z",
    });

    const rows = res.data.values || [];
    const headers = [
      "id",
      "invoice_id",
      "tenant_id",
      "tenant_name",
      "amount",
      "method",
      "ref",
      "status",
      "notes",
      "created_at",
      "receipt_link",
    ];

    const payments = rows.map((r) =>
      Object.fromEntries(headers.map((h, i) => [h, r[i] || ""]))
    );

    return NextResponse.json(payments);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sheets = await getSheets();
    await ensureSheetTabs();

    const row = [
      body.id,
      body.invoice_id,
      body.tenant_id,
      body.tenant_name,
      body.amount,
      body.method,
      body.ref,
      body.status,
      body.notes || "",
      body.created_at || new Date().toISOString(),
      body.receipt_link || "",
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Payments!A:Z",
      valueInputOption: "RAW",
      requestBody: { values: [row] },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
