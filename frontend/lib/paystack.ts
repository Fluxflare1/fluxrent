import fetch from "node-fetch"

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_INITIALIZE_URL = "https://api.paystack.co/transaction/initialize"
const PAYSTACK_VERIFY_URL_BASE = "https://api.paystack.co/transaction/verify"

if (!PAYSTACK_SECRET) {
  console.warn("Paystack secret key not configured - /api/paystack endpoints will fail.")
}

/**
 * initializeTransaction - creates transaction on Paystack and returns authorization URL
 * @param {number} amount in NGN or base currency in kobo => Paystack expects amount in kobo
 * @param {string} email
 * @param {object} metadata additional metadata
 */
export async function initializeTransaction(amount: number, email: string, metadata: any = {}) {
  const body = {
    email,
    amount: Math.round(amount), // assume caller sends in kobo if using NGN; handle conversion on caller
    callback_url: process.env.PAYSTACK_CALLBACK_URL,
    metadata
  }

  const resp = await fetch(PAYSTACK_INITIALIZE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  })

  const data = await resp.json()
  if (!data.status) throw new Error(data.message || "Paystack initialize failed")
  return data.data // includes authorization_url, reference, access_code, amount
}

/**
 * verifyTransaction - verify transaction by reference
 */
export async function verifyTransaction(reference: string) {
  const url = `${PAYSTACK_VERIFY_URL_BASE}/${encodeURIComponent(reference)}`
  const resp = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` }
  })
  const data = await resp.json()
  if (!data.status) throw new Error(data.message || "Paystack verify failed")
  return data.data
}
