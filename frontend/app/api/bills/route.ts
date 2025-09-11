// frontend/app/api/bills/route.ts
import { NextResponse } from 'next/server'
import { getBills, addBill } from '../../../lib/googleSheets'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const apartment_id = url.searchParams.get('apartment_id') || undefined
    const tenant_id = url.searchParams.get('tenant_id') || undefined
    const status = url.searchParams.get('status') || undefined
    const period = url.searchParams.get('period') || undefined
    const filters:any = {}
    if (apartment_id) filters.apartment_id = apartment_id
    if (tenant_id) filters.tenant_id = tenant_id
    if (status) filters.status = status
    if (period) filters.period = period
    const rows = await getBills(filters)
    return NextResponse.json(rows)
  } catch (err:any) {
    console.error('GET /api/bills error', err)
    return NextResponse.json({ error: err.message || 'Failed' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (!body.apartment_id || !body.amount) return NextResponse.json({ error: 'apartment_id and amount required' }, { status: 400 })
    const bill = await addBill(body)
    return NextResponse.json({ ok: true, bill })
  } catch (err:any) {
    console.error('POST /api/bills error', err)
    return NextResponse.json({ error: err.message || 'Failed' }, { status: 500 })
  }
}
