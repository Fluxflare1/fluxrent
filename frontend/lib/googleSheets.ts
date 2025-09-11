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

/* --------------------------
   Tenants
   -------------------------- */
export async function getTenants() {
  const sheets = getSheetsClient()
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Tenants!A2:L' })
  return res.data.values || []
}

export async function addTenant(data: any) {
  const sheets = getSheetsClient()
  const tenantId = data.id || `t_${Date.now()}`
  const values = [[
    tenantId,
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

  // Auto-assign apartment if apartment_id provided
  if (data.apartment_id) {
    // find apartment and update tenant columns (H/I/J/K)
    const aptRowsRes = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Apartments!A2:L' })
    const aptRows = aptRowsRes.data.values || []
    const idx = aptRows.findIndex((r:any[]) => (r[0] || '') === data.apartment_id)
    if (idx !== -1) {
      const sheetRowNumber = idx + 2
      const updates:any[] = []
      updates.push({ range: `Apartments!H${sheetRowNumber}`, values: [[tenantId]] }) // tenant_id
      updates.push({ range: `Apartments!I${sheetRowNumber}`, values: [[data.name || '']] }) // tenant_name
      if (data.start_date) updates.push({ range: `Apartments!J${sheetRowNumber}`, values: [[data.start_date]] })
      if (data.end_date) updates.push({ range: `Apartments!K${sheetRowNumber}`, values: [[data.end_date]] })
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: { valueInputOption: 'USER_ENTERED', data: updates }
      })
    }
  }

  return { id: tenantId, ...values[0] }
}

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

/* --------------------------
   Payments (existing)
   -------------------------- */
export async function getPayments() {
  const sheets = getSheetsClient()
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Payments!A2:L' })
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
    new Date().toISOString(),
    data.receipt_link || ''
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
    now,
    ''
  ]
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Payments!A2',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [row] }
  })
  return row
}

/* --------------------------
   Utilities (existing)
   -------------------------- */
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

/* --------------------------
   Properties & Apartments (existing)
   -------------------------- */
export async function addProperty(data: any) {
  const sheets = getSheetsClient()
  const row = [
    data.id || `prop_${Date.now()}`,
    data.name || '',
    data.address || '',
    data.city || '',
    data.state || '',
    data.country || '',
    data.num_units || 0,
    data.created_at || new Date().toISOString()
  ]
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Properties!A2',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [row] }
  })
  return { id: row[0], name: row[1] }
}

export async function getProperties() {
  const sheets = getSheetsClient()
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Properties!A2:H' })
  const rows = res.data.values || []
  return rows.map((r:any[]) => ({
    id: r[0] || '',
    name: r[1] || '',
    address: r[2] || '',
    city: r[3] || '',
    state: r[4] || '',
    country: r[5] || '',
    num_units: Number(r[6] || 0),
    created_at: r[7] || ''
  }))
}

export async function addApartment(data: any) {
  const sheets = getSheetsClient()
  const row = [
    data.id || `apt_${Date.now()}`,
    data.property_id || '',
    data.unit_number || '',
    data.type || '',
    data.size || '',
    Number(data.rent_amount || 0),
    data.status || 'vacant',
    data.tenant_id || '',
    data.tenant_name || '',
    data.lease_start || '',
    data.lease_end || '',
    data.created_at || new Date().toISOString()
  ]
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Apartments!A2',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [row] }
  })
  return {
    id: row[0],
    property_id: row[1],
    unit_number: row[2],
    rent_amount: row[5]
  }
}

export async function getApartments(propertyId?: string) {
  const sheets = getSheetsClient()
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Apartments!A2:L' })
  const rows = res.data.values || []
  const items = rows.map((r:any[]) => ({
    id: r[0] || '',
    property_id: r[1] || '',
    unit_number: r[2] || '',
    type: r[3] || '',
    size: r[4] || '',
    rent_amount: Number(r[5] || 0),
    status: r[6] || '',
    tenant_id: r[7] || '',
    tenant_name: r[8] || '',
    lease_start: r[9] || '',
    lease_end: r[10] || '',
    created_at: r[11] || ''
  }))
  return propertyId ? items.filter(i => i.property_id === propertyId) : items
}

export async function assignTenantToApartment(apartmentId: string, tenantId: string, tenantName: string, leaseStart?: string, leaseEnd?: string) {
  const sheets = getSheetsClient()
  const rowsRes = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Apartments!A2:L' })
  const rows = rowsRes.data.values || []
  const idx = rows.findIndex(r => (r[0] || '') === apartmentId)
  if (idx === -1) throw new Error('Apartment not found')
  const sheetRowNumber = idx + 2
  const updates:any[] = []
  updates.push({ range: `Apartments!H${sheetRowNumber}`, values: [[tenantId]] })
  updates.push({ range: `Apartments!I${sheetRowNumber}`, values: [[tenantName]] })
  if (leaseStart) updates.push({ range: `Apartments!J${sheetRowNumber}`, values: [[leaseStart]] })
  if (leaseEnd) updates.push({ range: `Apartments!K${sheetRowNumber}`, values: [[leaseEnd]] })

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { valueInputOption: 'USER_ENTERED', data: updates }
  })
  return { ok: true }
}

/* --------------------------
   RentSchedules -> now creates Bills as canonical entries
   -------------------------- */

/**
 * addRentScheduleRow - legacy helper left for compatibility (creates RentSchedules)
 */
export async function addRentScheduleRow(data: any) {
  const sheets = getSheetsClient()
  const row = [
    data.id || `rs_${Date.now()}`,
    data.apartment_id || '',
    data.tenant_id || '',
    data.tenant_name || '',
    data.due_date || '',
    data.period || '',
    Number(data.amount || 0),
    data.status || 'due',
    data.payment_reference || '',
    data.paid_date || '',
    data.invoice_id || '',
    data.created_at || new Date().toISOString(),
    data.notes || ''
  ]
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'RentSchedules!A2',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [row] }
  })
  return {
    id: row[0],
    apartment_id: row[1],
    tenant_id: row[2],
    due_date: row[4],
    period: row[5],
    amount: row[6],
    status: row[7]
  }
}

/**
 * addBill - create a canonical Bill row attached to an apartment
 * Bill header:
 * id | apartment_id | bill_type | period | issue_date | due_date | amount | balance | status | linked_schedule_id | tenant_id | tenant_name | created_at | notes | invoice_id | source
 */
export async function addBill(data: any) {
  const sheets = getSheetsClient()
  const id = data.id || `bill_${Date.now()}`
  const amount = Number(data.amount || 0)
  const row = [
    id,
    data.apartment_id || '',
    data.bill_type || 'rent',
    data.period || '',
    data.issue_date || new Date().toISOString().split('T')[0],
    data.due_date || '',
    amount,
    Number(data.balance ?? amount),
    data.status || 'due',
    data.linked_schedule_id || '',
    data.tenant_id || '',
    data.tenant_name || '',
    data.created_at || new Date().toISOString(),
    data.notes || '',
    data.invoice_id || '',
    data.source || 'manual'
  ]
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Bills!A2',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [row] }
  })
  return {
    id: row[0],
    apartment_id: row[1],
    amount: row[6],
    balance: row[7],
    status: row[8],
    due_date: row[5]
  }
}

/**
 * getBills - list bills with optional filters
 * filters: { apartment_id?, tenant_id?, status?, period? }
 */
export async function getBills(filters: any = {}) {
  const sheets = getSheetsClient()
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Bills!A2:P' })
  const rows = res.data.values || []
  const items = rows.map((r:any[]) => ({
    id: r[0] || '',
    apartment_id: r[1] || '',
    bill_type: r[2] || '',
    period: r[3] || '',
    issue_date: r[4] || '',
    due_date: r[5] || '',
    amount: Number(r[6] || 0),
    balance: Number(r[7] || 0),
    status: r[8] || '',
    linked_schedule_id: r[9] || '',
    tenant_id: r[10] || '',
    tenant_name: r[11] || '',
    created_at: r[12] || '',
    notes: r[13] || '',
    invoice_id: r[14] || '',
    source: r[15] || ''
  }))
  return items.filter(item => {
    if (filters.apartment_id && item.apartment_id !== filters.apartment_id) return false
    if (filters.tenant_id && item.tenant_id !== filters.tenant_id) return false
    if (filters.status && item.status !== filters.status) return false
    if (filters.period && item.period !== filters.period) return false
    return true
  })
}

/**
 * getBillById
 */
export async function getBillById(billId: string) {
  const sheets = getSheetsClient()
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Bills!A2:P' })
  const rows = res.data.values || []
  const idx = rows.findIndex(r => (r[0] || '') === billId)
  if (idx === -1) throw new Error('Bill not found')
  const r = rows[idx]
  return {
    id: r[0],
    apartment_id: r[1],
    bill_type: r[2],
    period: r[3],
    issue_date: r[4],
    due_date: r[5],
    amount: Number(r[6] || 0),
    balance: Number(r[7] || 0),
    status: r[8] || '',
    linked_schedule_id: r[9] || '',
    tenant_id: r[10] || '',
    tenant_name: r[11] || '',
    created_at: r[12] || '',
    notes: r[13] || '',
    invoice_id: r[14] || '',
    source: r[15] || ''
  }
}

/**
 * addBillPayment - append a BillPayments row (log of payments applied to bills)
 * BillPayments header:
 * id | bill_id | payment_reference | payer_tenant_id | payer_name | amount | method | verified | receipt_link | created_at | notes
 *
 * This function also updates the Bill's balance & status and writes a Payments row (if required).
 */
export async function addBillPayment({ bill_id, payment_reference, payer_tenant_id, payer_name, amount, method, verified, receipt_link, notes }: any) {
  const sheets = getSheetsClient()
  const paymentId = `bp_${Date.now()}`
  const row = [
    paymentId,
    bill_id,
    payment_reference || `payref_${Date.now()}`,
    payer_tenant_id || '',
    payer_name || '',
    Number(amount || 0),
    method || 'manual',
    verified ? 'yes' : 'no',
    receipt_link || '',
    new Date().toISOString(),
    notes || ''
  ]
  // Append BillPayments row
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'BillPayments!A2',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [row] }
  })

  // Update bill balance & status
  // Fetch Bills to find row index
  const billsRes = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Bills!A2:P' })
  const billsRows = billsRes.data.values || []
  const billIdx = billsRows.findIndex((r:any[]) => (r[0] || '') === bill_id)
  if (billIdx === -1) throw new Error('Bill not found for payment application')
  const sheetRowNumber = billIdx + 2
  const currentBalance = Number(billsRows[billIdx][7] || 0)
  const newBalance = Number((currentBalance - Number(amount || 0)).toFixed(2))
  const newStatus = newBalance <= 0 ? 'paid' : 'partial'

  const updates = [
    { range: `Bills!H${sheetRowNumber}`, values: [[newBalance]] }, // balance column H
    { range: `Bills!I${sheetRowNumber}`, values: [[newStatus]] } // status column I
  ]
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { valueInputOption: 'USER_ENTERED', data: updates }
  })

  // Add or link to Payments sheet
  // If a payment_reference exists in Payments - skip append; else append a new Payments row
  const paymentsRes = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Payments!A2:L' })
  const paymentsRows = paymentsRes.data.values || []
  const found = paymentsRows.find((r:any[]) => (r[1] || '') === payment_reference)
  if (!found) {
    // create Payments row
    const paymentRow = [
      `p_${Date.now()}`,
      payment_reference || `ref_${Date.now()}`,
      payer_tenant_id || '',
      payer_name || '',
      new Date().toISOString(),
      'bill',
      Number(amount || 0),
      method || 'manual',
      verified ? 'paid' : 'pending',
      notes || '',
      new Date().toISOString(),
      receipt_link || ''
    ]
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Payments!A2',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [paymentRow] }
    })
  } else {
    // update existing payment row's status/receipt if necessary
    // find index & update receipt_link and status
    const pIdx = paymentsRows.findIndex((r:any[]) => (r[1] || '') === payment_reference)
    const paymentsRowNumber = pIdx + 2
    const pUpdates:any[] = []
    if (receipt_link) pUpdates.push({ range: `Payments!L${paymentsRowNumber}`, values: [[receipt_link]] })
    if (verified) pUpdates.push({ range: `Payments!I${paymentsRowNumber}`, values: [['paid']] })
    if (pUpdates.length) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: { valueInputOption: 'USER_ENTERED', data: pUpdates }
      })
    }
  }

  return { ok: true, bill_id, payment_reference: payment_reference || row[2], newBalance, newStatus }
}

/* --------------------------
   Utility helpers (notifications / templates etc) omitted here if previously present
   -------------------------- */

/* --------------------------
   Rent generator updated to create Bills
   -------------------------- */
/**
 * generateMonthlyBillsForProperty
 * For each apartment in property, if apartment has tenant create a Bill row for the period
 */
export async function generateMonthlyBillsForProperty(propertyId: string, period: string, dueDay = 5) {
  // period: 'YYYY-MM'
  const apartments = await getApartments(propertyId)
  const created:any[] = []
  for (const apt of apartments) {
    if (!apt.tenant_id) continue
    const [yearStr, monthStr] = period.split('-')
    const year = Number(yearStr), month = Number(monthStr)
    const dueDate = new Date(year, month - 1, dueDay).toISOString().split('T')[0]
    // create bill for rent
    const bill = await addBill({
      apartment_id: apt.id,
      bill_type: 'rent',
      period,
      issue_date: new Date().toISOString().split('T')[0],
      due_date: dueDate,
      amount: apt.rent_amount,
      balance: apt.rent_amount,
      status: 'due',
      tenant_id: apt.tenant_id,
      tenant_name: apt.tenant_name || '',
      source: 'auto-rent-schedule',
      notes: `Auto rent bill for ${period}`
    })
    created.push(bill)
  }
  return created
}
