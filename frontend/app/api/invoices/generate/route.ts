// frontend/app/api/invoices/generate/route.ts
import { NextResponse } from "next/server"
import { generateInvoicePdf } from "../../../../lib/invoicesPdf"
import { uploadToDrive } from "../../../../lib/drive"
import { addInvoiceRow } from "../../../../lib/googleSheets"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    // body: { tenant: {id,name,email}, lease_id, lines: [{description,amount}], due_date, invoice_number (optional) }
    if (!body || !body.tenant || !body.lines) return NextResponse.json({ error: 'tenant and lines required' }, { status: 400 })

    const subtotal = (body.lines || []).reduce((s:any,l:any) => s + Number(l.amount || 0), 0)
    const invoice = {
      id: `inv_${Date.now()}`,
      invoice_number: body.invoice_number || `INV-${new Date().getFullYear()}${new Date().getMonth()+1}-${Date.now().toString().slice(-6)}`,
      tenant_id: body.tenant.id || '',
      tenant: body.tenant,
      lease_id: body.lease_id || '',
      issued_date: new Date().toISOString().split('T')[0],
      due_date: body.due_date || '',
      subtotal,
      utilities_total: body.utilities_total || 0,
      total: Number(subtotal) + Number(body.utilities_total || 0),
      lines: body.lines || [],
      status: 'issued'
    }

    // generate PDF buffer
    const pdfBuffer = await generateInvoicePdf(invoice)

    // upload to Drive
    const filename = `${invoice.invoice_number}.pdf`
    const driveFile = await uploadToDrive(filename, "application/pdf", pdfBuffer)
    const pdfLink = driveFile.webViewLink || driveFile.webContentLink || `https://drive.google.com/file/d/${driveFile.id}/view`

    // append invoice row to Invoices sheet
    await addInvoiceRow({ ...invoice, pdf_link: pdfLink })

    return NextResponse.json({ ok: true, invoice: { ...invoice, pdf_link: pdfLink }, driveFile })
  } catch (err:any) {
    console.error("invoices/generate error", err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
