import { NextResponse } from 'next/server'
import { generateMonthlyRentSchedulesForProperty } from '../../../../lib/googleSheets'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    // body: { property_id, period (YYYY-MM), due_day (optional int) }
    if (!body || !body.property_id || !body.period) return NextResponse.json({ error: 'property_id and period required' }, { status: 400 })
    const created = await generateMonthlyRentSchedulesForProperty(body.property_id, body.period, body.due_day || 5)
    return NextResponse.json({ ok: true, created })
  } catch (e:any) {
    console.error('POST /api/rents/generate', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
