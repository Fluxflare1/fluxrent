// frontend/app/api/notifications/route.ts
import { NextResponse } from "next/server"
import { logNotification, getNotifications } from "../../../lib/googleSheets"
import fetch from "node-fetch"

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
const EMAIL_FROM = process.env.EMAIL_FROM || "no-reply@example.com"
const WABA_TOKEN = process.env.WABA_TOKEN
const WABA_PHONE_NUMBER_ID = process.env.WABA_PHONE_NUMBER_ID

async function sendEmail(to: string, subject: string, html: string) {
  if (!SENDGRID_API_KEY) throw new Error("SendGrid not configured")
  const payload = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: EMAIL_FROM },
    subject,
    content: [{ type: "text/html", value: html }]
  }
  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`SendGrid failed: ${res.status} ${txt}`)
  }
  return { ok: true }
}

async function sendWhatsApp(to: string, message: string) {
  if (!WABA_TOKEN || !WABA_PHONE_NUMBER_ID) throw new Error("WABA not configured")
  const url = `https://graph.facebook.com/v17.0/${WABA_PHONE_NUMBER_ID}/messages`
  const payload = { messaging_product: "whatsapp", to, text: { body: message } }
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${WABA_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(`WABA failed: ${JSON.stringify(data)}`)
  return data
}

export async function GET() {
  try {
    const rows = await getNotifications()
    return NextResponse.json(rows)
  } catch (err: any) {
    console.error("GET /api/notifications error", err)
    return NextResponse.json({ error: err.message || "Failed" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    // body: { toEmail?, toPhone?, subject?, message?, channels: ['email','whatsapp'], type?, template? }
    const results: any = {}
    let status = "sent"
    try {
      if ((body.channels || []).includes("email") && body.toEmail) {
        await sendEmail(body.toEmail, body.subject || "Notification", body.message || "")
        results.email = "sent"
      }
      if ((body.channels || []).includes("whatsapp") && body.toPhone) {
        await sendWhatsApp(body.toPhone, body.message || "")
        results.whatsapp = "sent"
      }
    } catch (e: any) {
      status = "failed"
      results.error = e.message || String(e)
      console.error("notification send error", e)
    }
    // log everything in Notifications sheet
    await logNotification({ to_email: body.toEmail || '', to_phone: body.toPhone || '', type: body.type || 'manual', template: body.template || '', status, response: results })
    return NextResponse.json({ ok: true, results })
  } catch (err: any) {
    console.error("POST /api/notifications error", err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
