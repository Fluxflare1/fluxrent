// frontend/lib/googleSheets.ts
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

export async function updateTenantKyc(tenantId: string, kycLink: string) {
  // Find tenant row and update the kyc_link column (column H index 8 in our A..L)
  // We will read the Tenants sheet, find the row index and update specific cell
  const sheets = getSheets()
  const tenantRows = (await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Tenants!A2:L' })).data.values || []
  const rowIndex = tenantRows.findIndex(r => (r[0] || '').toString() === tenantId)
  if (rowIndex === -1) {
    throw new Error(`Tenant with id ${tenantId} not found`)
  }
  const sheetRowNumber = rowIndex + 2 // because data starts at row 2
  const kycCell = `H${sheetRowNumber}` // H column is 8th: A B C D E F G H ...
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `Tenants!${kycCell}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [[kycLink]] }
  })
  return { ok: true, tenantId, kycLink }
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
  return row
}

/**
 * recordPaymentFromPaystack
 * Accepts verified paystack payload and appends a Payments row.
 * Expects fields: reference, amount (in kobo), customer_email, metadata (object, may include tenant_id)
 */
export async function recordPaymentFromPaystack({ reference, amount, customer_email, metadata }: any) {
  const sheets = getSheets()
  const tenantId = metadata?.tenant_id || ''
  const tenantName = metadata?.tenant_name || customer_email || ''
  const amountFloat = (Number(amount) / 100).toFixed(2)
  const now = new Date().toISOString()
  const row = [
    `p_${Date.now()}`,
    reference || '',
    tenantId,
    tenantName,
    now,
    'rent',
    amountFloat,
    'paystack',
    'paid',
    JSON.stringify(metadata || {}),
    now
  ]
  await sheets.spreadsheets.values.append({ spreadsheetId: SHEET_ID, range: 'Payments!A2', valueInputOption: 'USER_ENTERED', requestBody: { values: [row] } })
  return row
}
