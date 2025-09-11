import { NextResponse } from 'next/server'
import { getPayments, recordPayment } from '../../../lib/googleSheets'

export async function GET() {
  try {
    const payments = await getPayments()
    return NextResponse.json(payments)
  } catch (e:any) {
    console.error(e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const p = await recordPayment(body)
    return NextResponse.json(p)
  } catch (e:any) {
    console.error(e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
