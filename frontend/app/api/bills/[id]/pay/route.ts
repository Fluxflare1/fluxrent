// frontend/app/api/bills/[id]/pay/route.ts
import { NextResponse } from 'next/server'
import { addBillPayment, getBillById } from '../../../../lib/googleSheets'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const billId = params.id
    // body: { payment_reference, payer_tenant_id, payer_name, amount, method, verified, receipt_link, notes }
    const body = await req.json()
    if (!body || !body.amount) return NextResponse.json({ error: 'amount required' }, { status: 400 })

    // optional: validate amount <= bill.amount or allow overpayment
    const bill = await getBillById(billId)
    if (!bill) return NextResponse.json({ error: 'bill not found' }, { status: 404 })

    const res = await addBillPayment({
      bill_id: billId,
      payment_reference: body.payment_reference || `ref_${Date.now()}`,
      payer_tenant_id: body.payer_tenant_id || bill.tenant_id || '',
      payer_name: body.payer_name || body.payer_name || bill.tenant_name || '',
      amount: Number(body.amount || 0),
      method: body.method || 'manual',
      verified: body.verified ? true : false,
      receipt_link: body.receipt_link || '',
      notes: body.notes || ''
    })

    return NextResponse.json({ ok: true, result: res })
  } catch (err:any) {
    console.error('POST /api/bills/[id]/pay error', err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
