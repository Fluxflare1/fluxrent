import { google } from 'googleapis'

function getAuth() {
  const credentials = {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  }
  if (!credentials.client_email || !credentials.private_key) {
    throw new Error('Google credentials not set in environment variables.')
  }
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets','https://www.googleapis.com/auth/drive']
  })
  return auth
}

function getSheets() {
  const auth = getAuth()
  return google.sheets({ version: 'v4', auth })
}

const SHEET_ID = process.env.GOOGLE_SHEETS_ID || ''

export async function getTenants() {
  const sheets = getSheets()
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Tenants!A2:L' })
  return res.data.values || []
}

export async function addTenant(data: any) {
  const sheets = getSheets()
  const values = [[
    data.id || `t_${Date.now()}`,
    data.name || '',
    data.email || '',
    data.phone || '',
    data.tenant_type || '',
    data.property || '',
    data.unit || '',
    data.kyc_link || '',
    data.status || 'active',
    data.start_date || '',
    data.end_date || '',
    data.created_at || new Date().toISOString()
  ]]
  await sheets.spreadsheets.values.append({ spreadsheetId: SHEET_ID, range: 'Tenants!A2', valueInputOption: 'USER_ENTERED', requestBody: { values } })
  return values[0]
}

export async function getPayments() {
  const sheets = getSheets()
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Payments!A2:K' })
  return res.data.values || []
}

export async function recordPayment(data: any) {
  const sheets = getSheets()
  const row = [
    data.id || `p_${Date.now()}`,
    data.payment_reference || data.id || '',
    data.tenant_id || '',
    data.tenant_name || data.tenantName || '',
    data.date || new Date().toISOString(),
    data.type || 'rent',
    data.amount || '',
    data.method || 'manual',
    data.status || 'paid',
    data.notes || '',
    new Date().toISOString()
  ]
  await sheets.spreadsheets.values.append({ spreadsheetId: SHEET_ID, range: 'Payments!A2', valueInputOption: 'USER_ENTERED', requestBody: { values: [row] } })
  // Optionally allocate to invoices here (not yet implemented)
  return row
}
