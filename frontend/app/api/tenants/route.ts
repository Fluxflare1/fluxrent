import { NextResponse } from 'next/server'
import { getTenants, addTenant } from '../../../lib/googleSheets'
import { googleSheets } from "@/lib/googleSheets";

export async function GET() {
  try {
    const tenants = await getTenants()
    return NextResponse.json(tenants)
  } catch (e:any) {
    console.error(e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const newTenant = await addTenant(body)
    return NextResponse.json(newTenant)
  } catch (e:any) {
    console.error(e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}




export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, apartment_id } = body;

    const sheets = await googleSheets();
    const sheetId = process.env.GOOGLE_SHEET_ID!;
    const tenantSheet = "Tenants";

    const newRow = [name, phone, email, new Date().toISOString()];
    const appendRes = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${tenantSheet}!A:D`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [newRow] },
    });

    const rowIndex = appendRes.data.updates?.updatedRange?.match(/\d+$/)?.[0];
    const tenantId = `TNT-${rowIndex}`;

    // Auto-assign if apartment_id passed
    if (apartment_id) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: `Assignments!A:C`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[tenantId, apartment_id, new Date().toISOString()]],
        },
      });
    }

    return NextResponse.json({ id: tenantId, name, phone, email });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to add tenant" },
      { status: 500 }
    );
  }
}



import { NextResponse } from "next/server";
import { getSheets, ensureSheetTabs } from "@/app/lib/googleSheets";

const spreadsheetId = process.env.GOOGLE_SHEET_ID!;

export async function GET(req: Request) {
  try {
    const sheets = await getSheets();
    await ensureSheetTabs();

    // Load Invoices
    const invRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Invoices!A2:Z",
    });
    const invHeaders = ["id","apartment_id","tenant_id","period","amount","status","created_at"];
    const invoices = (invRes.data.values || []).map((r) =>
      Object.fromEntries(invHeaders.map((h, i) => [h, r[i] || ""]))
    );

    // Load Payments
    const payRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Payments!A2:Z",
    });
    const payHeaders = ["id","invoice_id","tenant_id","tenant_name","amount","method","ref","status","notes","created_at","receipt_link"];
    const payments = (payRes.data.values || []).map((r) =>
      Object.fromEntries(payHeaders.map((h, i) => [h, r[i] || ""]))
    );

    return NextResponse.json({ invoices, payments });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
