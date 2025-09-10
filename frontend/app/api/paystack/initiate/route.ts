import { NextResponse } from "next/server"
import { initializeTransaction } from "../../../../lib/paystack"

export async function POST(req: Request) {
  const body = await req.json()
  // body: { amountKobo, email, metadata }
  if (!body || !body.amountKobo || !body.email) return NextResponse.json({ error: "amountKobo and email required" }, { status: 400 })
  try {
    const data = await initializeTransaction(body.amountKobo, body.email, body.metadata || {})
    // return authorization_url and reference to frontend
    return NextResponse.json({ ok: true, data })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
