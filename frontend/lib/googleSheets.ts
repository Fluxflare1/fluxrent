import { google } from "googleapis"

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
})

const sheets = google.sheets({ version: "v4", auth })
const SHEET_ID = process.env.GOOGLE_SHEETS_ID!

export async function getTenants() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Tenants!A2:H",
  })
  return res.data.values || []
}

export async function addTenant(data: any) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: "Tenants!A2",
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [[data.name, data.email, data.phone, data.apartment]] }
  })
  return data
}

export async function recordPayment(data: any) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: "Payments!A2",
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [[data.tenantId, data.amount, data.date, data.status]] }
  })
  return data
}
