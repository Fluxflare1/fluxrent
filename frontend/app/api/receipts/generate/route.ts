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
