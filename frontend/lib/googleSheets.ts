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
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive'
    ]
  })
  return auth
}

function getSheetsClient() {
  const auth = getAuth()
  return google.sheets({ version: 'v4', auth })
}

const SHEET_ID = process.env.GOOGLE_SHEETS_ID || ''

/* TENANTS (unchanged) */
export async function getTenants() {
  const sheets = getSheetsClient()
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Tenants!A2:L' })
  return res.data.values || []
}

export async function addTenant(data: any) {
  const sheets = getSheetsClient()
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
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Tenants!A2',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values }
  })
  return values[0]
}

/* UPDATE TENANT KYC (unchanged) */
export async function updateTenantKyc(tenantId: string, kycLink: string) {
  const sheets = getSheetsClient()
  const tenantRows = (await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Tenants!A2:L' })).data.values || []
  const rowIndex = tenantRows.findIndex(r => (r[0] || '').toString() === tenantId)
  if (rowIndex === -1) throw new Error(`Tenant with id ${tenantId} not found`)
  const sheetRowNumber = rowIndex + 2
  const kycCell = `H${sheetRowNumber}`
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `Tenants!${kycCell}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [[kycLink]] }
  })
  return { ok: true, tenantId, kycLink }
}

/* PAYMENTS (unchanged) */
export async function getPayments() {
  const sheets = getSheetsClient()
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Payments!A2:K' })
  return res.data.values || []
}

export async function recordPayment(data: any) {
  const sheets = getSheetsClient()
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
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Payments!A2',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [row] }
  })
  return row
}

export async function recordPaymentFromPaystack({ reference, amount, customer_email, metadata }: any) {
  const sheets = getSheetsClient()
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
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Payments!A2',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [row] }
  })
  return row
}

/* UTILITIES (unchanged) */
export async function getUtilities() {
  const sheets = getSheetsClient()
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Utilities!A2:K' })
  const rows = res.data.values || []
  return rows.map((r: any[]) => ({
    id: r[0] || null,
    tenant_id: r[1] || '',
    month: r[2] || '',
    LAWMA: Number(r[3] || 0),
    Cleaner: Number(r[4] || 0),
    Water: Number(r[5] || 0),
    Community: Number(r[6] || 0),
    Misc: Number(r[7] || 0),
    BankCharges: Number(r[8] || 0),
    total: Number(r[9] || 0),
    created_at: r[10] || ''
  }))
}

export async function addUtility(data: any) {
  const sheets = getSheetsClient()
  const LAWMA = Number(data.LAWMA || 0)
  const Cleaner = Number(data.Cleaner || 0)
  const Water = Number(data.Water || 0)
  const Community = Number(data.Community || 0)
  const Misc = Number(data.Misc || 0)
  const BankCharges = Number(data.BankCharges || 0)
  const total = LAWMA + Cleaner + Water + Community + Misc + BankCharges
  const row = [
    data.id || `u_${Date.now()}`,
    data.tenant_id || '',
    data.month || '',
    LAWMA,
    Cleaner,
    Water,
    Community,
    Misc,
    BankCharges,
    total,
    data.created_at || new Date().toISOString()
  ]
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Utilities!A2',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [row] }
  })
  return {
    id: row[0],
    tenant_id: row[1],
    month: row[2],
    LAWMA,
    Cleaner,
    Water,
    Community,
    Misc,
    BankCharges,
    total,
    created_at: row[10]
  }
}

/* TEMPLATES & AGREEMENTS */

/**
 * getTemplates - read Templates sheet (id | name | drive_link | created_at)
 */
export async function getTemplates() {
  const sheets = getSheetsClient()
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Templates!A2:D' })
  const rows = res.data.values || []
  return rows.map((r:any[]) => ({ id: r[0], name: r[1], drive_link: r[2], created_at: r[3] }))
}

/**
 * addTemplate - append template metadata to Templates sheet
 */
export async function addTemplate({ id, name, drive_link }: any) {
  const sheets = getSheetsClient()
  const row = [ id || `tpl_${Date.now()}`, name || 'template', drive_link || '', new Date().toISOString() ]
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Templates!A2',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [[...row]] }
  })
  return { id: row[0], name: row[1], drive_link: row[2], created_at: row[3] }
}

/**
 * addAgreement - create an Agreements row connecting tenant -> template -> file link
 * Agreements sheet header: id | tenant_id | template_id | drive_link | created_at
 */
export async function addAgreement({ tenant_id, template_id, drive_link }: any) {
  const sheets = getSheetsClient()
  const row = [ `agr_${Date.now()}`, tenant_id || '', template_id || '', drive_link || '', new Date().toISOString() ]
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Agreements!A2',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [row] }
  })
  return { id: row[0], tenant_id: row[1], template_id: row[2], drive_link: row[3], created_at: row[4] }
}

/* NOTIFICATIONS LOGGING */
export async function logNotification({ to_email, to_phone, type, template, status, response }: any) {
  const sheets = getSheetsClient()
  const row = [ `n_${Date.now()}`, to_email || '', to_phone || '', type || '', template || '', status || '', new Date().toISOString(), response ? JSON.stringify(response) : '' ]
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Notifications!A2',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [row] }
  })
  return { ok: true }
}

/* INVOICES sheet appending (used by PDF generator) */
export async function addInvoiceRow(invoiceData: any) {
  // invoiceData fields: id, invoice_number, tenant_id, lease_id, issued_date, due_date, subtotal, utilities_total, total, status, pdf_link
  const sheets = getSheetsClient()
  const row = [
    invoiceData.id || `inv_${Date.now()}`,
    invoiceData.invoice_number || '',
    invoiceData.tenant_id || '',
    invoiceData.lease_id || '',
    invoiceData.issued_date || '',
    invoiceData.due_date || '',
    invoiceData.subtotal || 0,
    invoiceData.utilities_total || 0,
    invoiceData.total || 0,
    invoiceData.status || 'issued',
    invoiceData.pdf_link || '',
    new Date().toISOString()
  ]
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Invoices!A2',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [row] }
  })
  return { ok: true, invoice: row }
}
