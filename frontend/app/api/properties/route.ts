import { NextResponse } from 'next/server'
import { getProperties, addProperty } from '../../../lib/googleSheets'

export async function GET() {
  try {
    const props = await getProperties()
    return NextResponse.json(props)
  } catch (e:any) {
    console.error('GET /api/properties', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (!body.name) return NextResponse.json({ error: 'name required' }, { status: 400 })
    const prop = await addProperty(body)
    return NextResponse.json({ ok: true, property: prop })
  } catch (e:any) {
    console.error('POST /api/properties', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
