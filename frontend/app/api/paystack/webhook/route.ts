import { NextResponse } from "next/server"
import crypto from "crypto"
import { recordPaymentFromPaystack } from "../../../../lib/googleSheets"

// Updated config format for Next.js 13+
export const config = {
  api: {
    bodyParser: false,
  },
}

function bufferToString(buffer: Buffer) {
  return buffer.toString('utf8')
}

export async function POST(req: Request) {
  try {
    const buf = await req.arrayBuffer()
    const raw = Buffer.from(buf)
    const signature = req.headers.get('x-paystack-signature') || ''
    const secret = process.env.PAYSTACK_SECRET_KEY || ''
    
    if (!secret) {
      console.warn("PAYSTACK_SECRET_KEY not set")
      return new Response("Missing secret", { status: 500 })
    }
    
    const hmac = crypto.createHmac('sha512', secret).update(raw).digest('hex')
    if (hmac !== signature) {
      console.warn("Invalid Paystack signature")
      return new Response("Invalid signature", { status: 400 })
    }

    const text = bufferToString(raw)
    const payload = JSON.parse(text)
    const event = payload.event
    
    if (event === "charge.success" || event === "payment.success") {
      const data = payload.data
      // data.amount is in kobo
      const reference = data.reference
      const amount = data.amount
      const customer_email = data.customer?.email || (data.customer && data.customer.email)
      const metadata = data.metadata || {}
      
      // record payment
      await recordPaymentFromPaystack({ reference, amount, customer_email, metadata })
      // optionally you can notify user via email/whatsapp (call notification endpoints)
    }
    
    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  } catch (err: any) {
    console.error("paystack webhook error", err)
    return new Response(String(err?.message || err), { status: 500 })
  }
}
