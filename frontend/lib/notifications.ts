import fetch from "node-fetch"

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
const EMAIL_FROM = process.env.EMAIL_FROM

export async function sendEmail(to: string, subject: string, html: string, text?: string) {
  if (!SENDGRID_API_KEY) {
    console.warn("SENDGRID_API_KEY not configured; skipping sendEmail")
    return { ok: false, reason: "no_api_key" }
  }

  const payload = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: EMAIL_FROM || "no-reply@example.com" },
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
    const detail = await res.text()
    throw new Error(`SendGrid send failed: ${res.status} ${detail}`)
  }
  return { ok: true }
}

/**
 * sendWhatsApp - Sends a simple template/text via WhatsApp Cloud API (Facebook)
 * Requires WABA_TOKEN and WABA_PHONE_NUMBER_ID
 */
export async function sendWhatsApp(toPhone: string, message: string) {
  const token = process.env.WABA_TOKEN
  const phoneId = process.env.WABA_PHONE_NUMBER_ID
  if (!token || !phoneId) {
    console.warn("WABA environment not configured; skipping WhatsApp send")
    return { ok: false, reason: "no_waba_config" }
  }

  const url = `https://graph.facebook.com/v17.0/${phoneId}/messages`
  const payload = {
    messaging_product: "whatsapp",
    to: toPhone,
    type: "text",
    text: { preview_url: false, body: message }
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  })

  const data = await res.json()
  if (!res.ok) throw new Error(`WhatsApp send failed: ${JSON.stringify(data)}`)
  return data
}
