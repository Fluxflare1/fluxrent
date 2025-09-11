// frontend/app/api/receipts/generate/route.ts
import { NextResponse } from "next/server"
import { createReceiptPdfBuffer } from "../../../../lib/pdfService"
import { uploadToDrive } from "../../../../lib/drive"
import { addReceiptLinkToPayment } from "../../../../lib/googleSheets"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    // Expect body: { payment_reference, tenant_name, amount, date, notes, method }
    if (!body || !body.payment_reference) return NextResponse.json({ error: "payment_reference required" }, { status: 400 })

    const buffer = await createReceiptPdfBuffer(body)
    const filename = `RCPT-${body.payment_reference}.pdf`
    const driveFile = await uploadToDrive(filename, "application/pdf", buffer)
    const receiptLink = driveFile.webViewLink || driveFile.webContentLink || `https://drive.google.com/file/d/${driveFile.id}/view`

    // update payment row with receipt link
    await addReceiptLinkToPayment(body.payment_reference, receiptLink)

    return NextResponse.json({ ok: true, receipt_link: receiptLink })
  } catch (err: any) {
    console.error("POST /api/receipts/generate error", err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}


import { NextResponse } from "next/server";
import { getSheets, ensureSheetTabs } from "@/app/lib/googleSheets";
import { v4 as uuid } from "uuid";

const spreadsheetId = process.env.GOOGLE_SHEET_ID!;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sheets = await getSheets();
    await ensureSheetTabs();

    const receiptId = uuid();
    const receiptLink = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=0`; // could be replaced with PDF later

    const row = [
      receiptId,
      body.payment_reference,
      body.tenant_name,
      body.amount,
      body.date,
      body.method,
      body.notes || "",
      receiptLink,
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Receipts!A:Z",
      valueInputOption: "RAW",
      requestBody: { values: [row] },
    });

    return NextResponse.json({ ok: true, receipt_link: receiptLink });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
