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

/* TENANTS */
export async function getTenants() {
  const sheets = getSheetsClient()
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Tenants!A2:L' })
  return res.data.values || []
}

/* PAYMENTS (existing) */
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

/**
 * addReceiptLinkToPayment - finds payment by reference in Payments sheet column B and updates column L (receipt_link)
 * Assumes: Payments columns: A:id B:payment_reference ... K:created_at L:receipt_link (if not present adjust)
 */
export async function addReceiptLinkToPayment(paymentReference: string, receiptLink: string) {
  const sheets = getSheetsClient()
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Payments!A2:L' })
  const rows = res.data.values || []
  const rowIndex = rows.findIndex(r => (r[1] || '').toString() === paymentReference)
  if (rowIndex === -1) {
    // Payment not found - append as a new row with receipt link in L
    const newRow = [ `p_${Date.now()}`, paymentReference, '', '', new Date().toISOString(), 'rent', '', '', 'paid', '', new Date().toISOString(), receiptLink ]
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Payments!A2',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [newRow] }
    })
    return { appended: true }
  } else {
    const sheetRowNumber = rowIndex + 2
    const receiptCell = `L${sheetRowNumber}`
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Payments!${receiptCell}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[receiptLink]] }
    })
    return { updated: true, row: sheetRowNumber }
  }
}

/* UTILITIES provided earlier omitted for brevity if already present in your file */

/* TEMPLATES/AGREEMENTS omitted (if present earlier) */

/* NOTIFICATIONS */
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

export async function getNotifications() {
  const sheets = getSheetsClient()
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Notifications!A2:H' })
  const rows = res.data.values || []
  return rows.map((r: any[]) => ({
    id: r[0] || '',
    to_email: r[1] || '',
    to_phone: r[2] || '',
    type: r[3] || '',
    template: r[4] || '',
    status: r[5] || '',
    sent_at: r[6] || '',
    response: r[7] || ''
  }))
}
