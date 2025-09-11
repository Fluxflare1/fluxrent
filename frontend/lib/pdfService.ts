// frontend/lib/pdfService.ts
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { format } from "date-fns";

/**
 * createReceiptPdfBuffer
 * @param payment { payment_reference, tenant_name, amount, date, notes, method }
 * returns Buffer
 */
export async function createReceiptPdfBuffer(payment: any) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 portrait
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const margin = 50;
  let y = height - margin;

  const titleSize = 20;
  page.drawText("Receipt", { x: margin, y: y - titleSize, size: titleSize, font, color: rgb(0.1,0.1,0.4) });
  y -= titleSize + 10;

  const small = 12;
  page.drawText(`Receipt #: ${payment.payment_reference || payment.id || ''}`, { x: margin, y: y - small, size: small, font });
  page.drawText(`Date: ${format(new Date(payment.date || new Date()), 'yyyy-MM-dd HH:mm')}`, { x: 350, y: y - small, size: small, font });
  y -= small + 12;

  page.drawText(`Received From: ${payment.tenant_name || payment.tenant || ''}`, { x: margin, y: y - small, size: small, font });
  y -= small + 6;

  page.drawText(`Amount: ${Number(payment.amount || 0).toFixed(2)}`, { x: margin, y: y - small, size: small, font });
  y -= small + 6;

  page.drawText(`Method: ${payment.method || 'N/A'}`, { x: margin, y: y - small, size: small, font });
  y -= small + 6;

  if (payment.notes) {
    page.drawText(`Notes: ${String(payment.notes).slice(0, 400)}`, { x: margin, y: y - small, size: small, font });
    y -= small + 6;
  }

  // Footer
  page.drawText("Thank you for your payment.", { x: margin, y: 80, size: 12, font, color: rgb(0.2,0.2,0.2) });
  page.drawText("Tenant Management System", { x: margin, y: 60, size: 10, font, color: rgb(0.3,0.3,0.3) });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

/**
 * createInvoicePdfBuffer
 * Accepts invoice object with lines: [{description, amount}], tenant, invoice_number, due_date, total
 */
export async function createInvoicePdfBuffer(invoice: any) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  let y = height - 50;
  const titleSize = 18;
  page.drawText(`Invoice: ${invoice.invoice_number}`, { x: 50, y: y - titleSize, size: titleSize, font });
  y -= titleSize + 10;

  page.drawText(`Tenant: ${invoice.tenant?.name || invoice.tenant_name || ''}`, { x: 50, y: y - 12, size: 12, font });
  page.drawText(`Due Date: ${invoice.due_date || ''}`, { x: 400, y: y - 12, size: 12, font });
  y -= 30;

  // table header
  page.drawText("Description", { x: 50, y: y - 12, size: 12, font });
  page.drawText("Amount", { x: 450, y: y - 12, size: 12, font });
  y -= 20;

  (invoice.lines || []).forEach((line: any) => {
    page.drawText(String(line.description || ''), { x: 50, y: y - 12, size: 11, font });
    page.drawText(Number(line.amount || 0).toFixed(2), { x: 450, y: y - 12, size: 11, font });
    y -= 18;
  });

  y -= 8;
  page.drawText(`Subtotal: ${Number(invoice.subtotal || 0).toFixed(2)}`, { x: 400, y: y - 12, size: 12, font });
  y -= 18;
  page.drawText(`Total: ${Number(invoice.total || 0).toFixed(2)}`, { x: 400, y: y - 12, size: 14, font });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
