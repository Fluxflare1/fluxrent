import { NextResponse } from "next/server"
import { sendEmail, sendWhatsApp } from "../../../lib/notifications"

export async function POST(req: Request) {
  const body = await req.json()
  /*
    body: { toEmail, toPhone, subject, message, channels: ['email','whatsapp'] }
  */
  try {
    const results: any = {}
    if ((body.channels || []).includes("email") && body.toEmail) {
      await sendEmail(body.toEmail, body.subject || "Notification", body.message)
      results.email = "sent"
    }
    if ((body.channels || []).includes("whatsapp") && body.toPhone) {
      await sendWhatsApp(body.toPhone, body.message)
      results.whatsapp = "sent"
    }
    return NextResponse.json({ ok: true, results })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
