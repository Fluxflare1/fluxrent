import { uploadToDrive } from "./drive"
import { google } from "googleapis"
import { getSheetClient } from "./sheetsClient"

/**
 * createInvoiceHTML - simple HTML invoice renderer
 * Replace with more professional templating (Handlebars/ejs) if needed.
 */
function createInvoiceHTML(invoice: any, tenant: any, lines: any[]) {
  const rows = lines.map(l => `<tr><td>${l.description}</td><td style="text-align:right">${Number(l.amount).toFixed(2)}</td></tr>`).join("")
  return `
  <html>
  <head><meta charset="utf-8"><title>Invoice ${invoice.invoice_number}</title></head>
  <body>
    <h1>Invoice: ${invoice.invoice_number}</h1>
    <p>Tenant: ${tenant.name}</p>
    <p>Due Date: ${invoice.due_date}</p>
    <table width="100%" border="0" cellpadding="6" cellspacing="0">
      <thead><tr><th>Description</th><th style="text-align:right">Amount</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr><td style="text-align:right"><strong>Total</strong></td><td style="text-align:right"><strong>${Number(invoice.total).toFixed(2)}</strong></td></tr></tfoot>
    </table>
  </body>
  </html>`
}

/**
 * generateInvoice - writes invoice row to Sheets and uploads invoice file to Drive (returns sheet row + drive link)
 * Assumes a Sheets helper module exists to write to Invoices sheet
 */
export async function generateInvoice(invoice: any, tenant: any, lines: any[]) {
  // render HTML
  const html = createInvoiceHTML(invoice, tenant, lines)
  // upload to Drive as HTML (or as PDF if you later add a converter)
  const filename = `INV-${invoice.invoice_number}.html`
  const file = await uploadToDrive(filename, "text/html", html)
  // write invoice to Sheets (simple append) — use sheets client helper
  const sheetsClient = getSheetClient()
  // Append to Invoices sheet: id, invoice_number, tenant_id, lease_id, issued_date, due_date, subtotal, utilities_total, total, status, pdf_link, created_at
  const values = [[
    invoice.id || invoice.invoice_number,
    invoice.invoice_number,
    invoice.tenant_id,
    invoice.lease_id || "",
    invoice.issued_date || new Date().toISOString().split("T")[0],
    invoice.due_date || "",
    invoice.subtotal || 0,
    invoice.utilities_total || 0,
    invoice.total,
    invoice.status || "issued",
    file.webViewLink || file.webContentLink || "",
    new Date().toISOString()
  ]]
  await sheetsClient.appendValues("Invoices!A2:L", values)
  return { invoice, file }
}
