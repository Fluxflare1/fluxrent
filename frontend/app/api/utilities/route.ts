// frontend/app/api/utilities/route.ts
import { NextResponse } from 'next/server'
import { getUtilities, addUtility } from '../../../lib/googleSheets'

export async function GET() {
  try {
    const rows = await getUtilities()
    return NextResponse.json(rows)
  } catch (err: any) {
    console.error('GET /api/utilities error', err)
    return NextResponse.json({ error: err.message || 'Failed to load utilities' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    // validate minimal fields
    if (!body.tenant_id || !body.month) {
      return NextResponse.json({ error: 'tenant_id and month are required' }, { status: 400 })
    }
    const saved = await addUtility(body)
    return NextResponse.json({ ok: true, utility: saved })
  } catch (err: any) {
    console.error('POST /api/utilities error', err)
    return NextResponse.json({ error: err.message || 'Failed to save utility' }, { status: 500 })
  }
}
