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

/* ------------------------
   Properties
   ------------------------ */
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

/* ------------------------
   Apartments (units)
   ------------------------ */
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
  // Tenant id -> column H (8th col), tenant name -> column I (9th), lease_start -> J, lease_end -> K
  updates.push({ range: `Apartments!H${sheetRowNumber}`, values: [[tenantId]] })
  updates.push({ range: `Apartments!I${sheetRowNumber}`, values: [[tenantName]] })
  if (leaseStart) updates.push({ range: `Apartments!J${sheetRowNumber}`, values: [[leaseStart]] })
  if (leaseEnd) updates.push({ range: `Apartments!K${sheetRowNumber}`, values: [[leaseEnd]] })

  // Batch update
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { valueInputOption: 'USER_ENTERED', data: updates }
  })
  return { ok: true }
}

/* ------------------------
   Rent Schedules
   ------------------------ */
/**
 * generateRentScheduleForApartment
 * Creates a schedule row for a single apartment for a particular period
 * period format: YYYY-MM (e.g., 2025-09)
 * due_date: ISO date string (e.g., 2025-09-05)
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
    data.status || 'due', // due, paid, overdue
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
 * generateMonthlyRentSchedulesForProperty
 * Generates rent schedule rows for all apartments in a property for a given period (YYYY-MM)
 * If an apartment has no tenant_id, it will be skipped (vacant)
 */
export async function generateMonthlyRentSchedulesForProperty(propertyId: string, period: string, dueDay = 5) {
  // dueDay: day of month when rent is due (default 5th)
  const apartments = await getApartments(propertyId)
  const created:any[] = []
  for (const apt of apartments) {
    if (!apt.tenant_id) continue // skip vacant
    // compute due date from period + dueDay
    const [yearStr, monthStr] = period.split('-')
    const year = Number(yearStr), month = Number(monthStr)
    const dueDate = new Date(year, month -1, dueDay).toISOString().split('T')[0]
    const row = await addRentScheduleRow({
      apartment_id: apt.id,
      tenant_id: apt.tenant_id,
      tenant_name: apt.tenant_name || '',
      due_date: dueDate,
      period,
      amount: apt.rent_amount,
      status: 'due',
      notes: `Auto schedule for ${period}`
    })
    created.push(row)
  }
  return created
}

/**
 * getRentSchedules - retrieves rent schedule rows optionally filtered
 * filters: { apartment_id?, tenant_id?, period?, status? }
 */
export async function getRentSchedules(filters: any = {}) {
  const sheets = getSheetsClient()
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'RentSchedules!A2:M' })
  const rows = res.data.values || []
  const items = rows.map((r:any[]) => ({
    id: r[0] || '',
    apartment_id: r[1] || '',
    tenant_id: r[2] || '',
    tenant_name: r[3] || '',
    due_date: r[4] || '',
    period: r[5] || '',
    amount: Number(r[6] || 0),
    status: r[7] || '',
    payment_reference: r[8] || '',
    paid_date: r[9] || '',
    invoice_id: r[10] || '',
    created_at: r[11] || '',
    notes: r[12] || ''
  }))
  // apply filters
  return items.filter(item => {
    if (filters.apartment_id && item.apartment_id !== filters.apartment_id) return false
    if (filters.tenant_id && item.tenant_id !== filters.tenant_id) return false
    if (filters.period && item.period !== filters.period) return false
    if (filters.status && item.status !== filters.status) return false
    return true
  })
}

/**
 * markRentPaid - marks a rent schedule entry as paid
 * updates status->paid, sets payment_reference, paid_date and optionally invoice_id
 */
export async function markRentPaid(scheduleId: string, paymentReference: string, paidDate?: string, invoiceId?: string) {
  const sheets = getSheetsClient()
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'RentSchedules!A2:M' })
  const rows = res.data.values || []
  const idx = rows.findIndex(r => (r[0] || '') === scheduleId)
  if (idx === -1) throw new Error('Rent schedule not found')
  const sheetRowNumber = idx + 2
  const updates:any[] = []
  updates.push({ range: `RentSchedules!H${sheetRowNumber}`, values: [['paid']] }) // status H
  updates.push({ range: `RentSchedules!I${sheetRowNumber}`, values: [[paymentReference]] }) // payment_reference I
  updates.push({ range: `RentSchedules!J${sheetRowNumber}`, values: [[paidDate || new Date().toISOString()]] }) // paid_date J
  if (invoiceId) updates.push({ range: `RentSchedules!K${sheetRowNumber}`, values: [[invoiceId]] }) // invoice_id K

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { valueInputOption: 'USER_ENTERED', data: updates }
  })
  return { ok: true, scheduleId, paymentReference }
}
