// frontend/app/api/paystack/initiate/route.ts
import { NextResponse } from "next/server"
import { initializeTransaction } from "../../../../lib/paystack"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (!body || !body.amountKobo || !body.email) {
      return NextResponse.json({ error: "amountKobo and email required" }, { status: 400 })
    }
    const data = await initializeTransaction(Number(body.amountKobo), String(body.email), body.metadata || {})
    // return authorization_url and reference to frontend
    return NextResponse.json({ ok: true, data })
  } catch (err: any) {
    console.error("paystack/initiate", err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
