// frontend/lib/invoicesPdf.ts
import PDFDocument from "pdfkit"
import getStream from "get-stream"

/**
 * generateInvoicePdf - creates a simple invoice PDF and returns Buffer
 * invoice: { invoice_number, tenant, due_date, lines: [{desc, amount}], total }
 */
export async function generateInvoicePdf(invoice: any) {
  const doc = new PDFDocument({ size: "A4", margin: 50 })
  const stream = doc.pipe(require("stream").PassThrough())

  // Header
  doc.fontSize(20).text(`Invoice: ${invoice.invoice_number}`, { align: "right" })
  doc.moveDown()
  doc.fontSize(12).text(`Tenant: ${invoice.tenant?.name || invoice.tenant_name || ''}`)
  doc.text(`Due Date: ${invoice.due_date || ''}`)
  doc.moveDown()

  // Table header
  doc.fontSize(12).text("Description", 50, doc.y, { continued: true })
  doc.text("Amount", 450, doc.y, { align: "right" })
  doc.moveDown()

  // Lines
  (invoice.lines || []).forEach((l:any) => {
    doc.text(l.description || l.desc || '-', 50, doc.y, { continued: true })
    doc.text(Number(l.amount ||	l.value || 0).toFixed(2), 450, doc.y, { align: "right" })
    doc.moveDown()
  })

  doc.moveDown()
  doc.fontSize(14).text(`Total: ${Number(invoice.total || 0).toFixed(2)}`, { align: "right" })

  doc.end()
  const buffer = await getStream.buffer(stream)
  return buffer
}
