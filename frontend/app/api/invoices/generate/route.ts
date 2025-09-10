import { NextResponse } from "next/server"
import { getSheetClient } from "../../../../lib/sheetsClient"
import { generateInvoice } from "../../../../lib/invoices"

export async function POST(req: Request) {
  const body = await req.json()
  /*
    body should contain:
    {
      tenant_id,
      lease_id,
      lines: [{ description, amount, type }],
      due_date,
      invoice_number (optional)
    }
  */
  if (!body || !body.tenant_id || !body.lines) return NextResponse.json({ error: "tenant_id and lines required" }, { status: 400 })
  try {
    const sheets = getSheetClient()
    // Simple tenant load from Tenants sheet (assumes ID is in column A)
    const tenants = await sheets.getValues("Tenants!A2:H")
    const tenantRow = tenants.find(r => r[0] === body.tenant_id)
    const tenant = tenantRow ? { id: tenantRow[0], name: tenantRow[1], email: tenantRow[4] } : { id: body.tenant_id, name: "Unknown" }

    const subtotal = body.lines.reduce((s: number, l: any) => s + Number(l.amount || 0), 0)
    const invoice = {
      id: `inv_${Date.now()}`,
      invoice_number: body.invoice_number || `INV-${new Date().getFullYear()}${new Date().getMonth()+1}-${Date.now().toString().slice(-6)}`,
      tenant_id: body.tenant_id,
      lease_id: body.lease_id || "",
      issued_date: new Date().toISOString().split("T")[0],
      due_date: body.due_date || "",
      subtotal,
      utilities_total: 0,
      total: subtotal,
      status: "issued"
    }

    const { invoice: inv, file } = await generateInvoice(invoice, tenant, body.lines)
    return NextResponse.json({ ok: true, invoice: inv, file })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
