import { NextResponse } from "next/server"
import crypto from "crypto"
import { getSheetClient } from "../../../../lib/sheetsClient"

export const config = { api: { bodyParser: false } }

function bufferToString(buffer: Buffer) {
  return buffer.toString("utf8")
}

export async function POST(req: Request) {
  // Read raw body buffer
  const buf = await req.arrayBuffer()
  const rawBody = Buffer.from(buf)
  const signature = req.headers.get("x-paystack-signature") || ""

  const secret = process.env.PAYSTACK_SECRET_KEY || ""
  const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex")
  if (hash !== signature) {
    console.warn("Invalid paystack signature")
    return new Response("Invalid signature", { status: 400 })
  }

  const text = bufferToString(rawBody)
  const payload = JSON.parse(text)
  // Example payload structure: { event: "charge.success", data: { ... } }
  try {
    const event = payload.event
    if (event === "charge.success") {
      const data = payload.data
      const reference = data.reference
      const amount = data.amount // in kobo
      const email = data.customer?.email || data.customer?.email
      const metadata = data.metadata || {}

      // record to Payments sheet
      const sheets = getSheetClient()
      const now = new Date().toISOString()
      await sheets.appendValues("Payments!A2", [[reference, metadata.tenant_id || "", email || "", (amount/100).toFixed(2), now, "paid", JSON.stringify(metadata)]])

      // Optionally: create ledger entry, mark invoices as paid, send notification (notified separately)
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  } catch (e) {
    console.error("paystack webhook error", e)
    return new Response("Error", { status: 500 })
  }
}
