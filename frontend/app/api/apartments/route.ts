import { NextResponse } from 'next/server'
import { getApartments, addApartment, assignTenantToApartment } from '../../../lib/googleSheets'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const property_id = url.searchParams.get('property_id') || undefined
    const data = await getApartments(property_id)
    return NextResponse.json(data)
  } catch (e:any) {
    console.error('GET /api/apartments', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (!body.property_id || !body.unit_number) return NextResponse.json({ error: 'property_id and unit_number required' }, { status: 400 })
    const apt = await addApartment(body)
    return NextResponse.json({ ok: true, apartment: apt })
  } catch (e:any) {
    console.error('POST /api/apartments', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// Assign tenant
export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { apartmentId, tenantId, tenantName, leaseStart, leaseEnd } = body
    if (!apartmentId || !tenantId) return NextResponse.json({ error: 'apartmentId and tenantId required' }, { status: 400 })
    const res = await assignTenantToApartment(apartmentId, tenantId, tenantName || '', leaseStart, leaseEnd)
    return NextResponse.json({ ok: true, result: res })
  } catch (e:any) {
    console.error('PUT /api/apartments', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
