// frontend/lib/paystack.ts
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || ''

if (!PAYSTACK_SECRET) {
  console.warn("Paystack secret not configured; Paystack endpoints will fail.")
}

export async function initializeTransaction(amountKobo: number, email: string, metadata: any = {}) {
  // amountKobo: amount in kobo (for NGN)
  const body = {
    email,
    amount: Math.round(amountKobo),
    callback_url: process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/api/paystack/webhook` : undefined,
    metadata
  }
  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  })
  const data = await res.json()
  if (!data.status) throw new Error(data.message || 'Paystack initialization failed')
  return data.data
}

export async function verifyTransaction(reference: string) {
  const url = `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`
  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` }
  })
  const data = await res.json()
  if (!data.status) throw new Error(data.message || 'Paystack verify failed')
  return data.data
}
