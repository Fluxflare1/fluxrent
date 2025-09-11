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
