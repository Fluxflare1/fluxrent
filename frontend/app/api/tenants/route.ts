import { NextResponse } from 'next/server'
import { getTenants, addTenant } from '../../../lib/googleSheets'

export async function GET() {
  try {
    const tenants = await getTenants()
    return NextResponse.json(tenants)
  } catch (e:any) {
    console.error(e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const newTenant = await addTenant(body)
    return NextResponse.json(newTenant)
  } catch (e:any) {
    console.error(e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
