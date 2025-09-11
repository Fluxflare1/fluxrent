import { NextResponse } from 'next/server'
import { getRentSchedules, markRentPaid } from '../../../lib/googleSheets'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const tenant_id = url.searchParams.get('tenant_id') || undefined
    const period = url.searchParams.get('period') || undefined
    const status = url.searchParams.get('status') || undefined
    const apartment_id = url.searchParams.get('apartment_id') || undefined
    const filters:any = {}
    if (tenant_id) filters.tenant_id = tenant_id
    if (period) filters.period = period
    if (status) filters.status = status
    if (apartment_id) filters.apartment_id = apartment_id
    const data = await getRentSchedules(filters)
    return NextResponse.json(data)
  } catch (e:any) {
    console.error('GET /api/rents', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    // Accepts marking paid via { scheduleId, paymentReference, paidDate, invoiceId }
    const body = await req.json()
    if (!body.scheduleId || !body.paymentReference) return NextResponse.json({ error: 'scheduleId & paymentReference required' }, { status: 400 })
    const res = await markRentPaid(body.scheduleId, body.paymentReference, body.paidDate, body.invoiceId)
    return NextResponse.json({ ok: true, result: res })
  } catch (e:any) {
    console.error('POST /api/rents', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
