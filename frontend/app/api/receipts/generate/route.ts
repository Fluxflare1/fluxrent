// frontend/app/api/receipts/generate/route.ts
import { NextResponse } from "next/server";
import { createReceiptPdfBuffer } from "../../../../lib/pdfService";
import { uploadToDrive } from "../../../../lib/drive";
import { addReceiptLinkToPayment, getSheets, ensureSheetTabs } from "@/app/lib/googleSheets";
import { v4 as uuid } from "uuid";

const spreadsheetId = process.env.GOOGLE_SHEET_ID!;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate
    if (!body || !body.payment_reference) {
      return NextResponse.json({ error: "payment_reference required" }, { status: 400 });
    }

    // Generate PDF receipt
    const buffer = await createReceiptPdfBuffer(body);
    const filename = `RCPT-${body.payment_reference}.pdf`;
    const driveFile = await uploadToDrive(filename, "application/pdf", buffer);
    const receiptLink =
      driveFile.webViewLink ||
      driveFile.webContentLink ||
      `https://drive.google.com/file/d/${driveFile.id}/view`;

    // Update sheet payment row with receipt link
    await addReceiptLinkToPayment(body.payment_reference, receiptLink);

    // Log receipt in Receipts sheet
    const sheets = await getSheets();
    await ensureSheetTabs();
    const receiptId = uuid();
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
  } catch (err: any) {
    console.error("POST /api/receipts/generate error", err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
