import { NextResponse } from "next/server"
import { getSheetClient } from "../../../lib/sheetsClient"

export async function POST(req: Request) {
  /* expected body:
     {
       tenant_id,
       month: "2025-09",
       LAWMA: 1000,
       Cleaner: 500,
       Water: 2500,
       Community: 0,
       Misc: 0,
       BankCharges: 0
     }
  */
  const body = await req.json()
  if (!body || !body.tenant_id || !body.month) return NextResponse.json({ error: "tenant_id & month required" }, { status: 400 })
  try {
    const sheets = getSheetClient()
    const total = ["LAWMA","Cleaner","Water","Community","Misc","BankCharges"].reduce((s, k) => s + Number(body[k] || 0), 0)
    await sheets.appendValues("Utilities!A2", [[
      body.tenant_id, body.month,
      body.LAWMA || 0, body.Cleaner || 0, body.Water || 0, body.Community || 0, body.Misc || 0, body.BankCharges || 0, total, new Date().toISOString()
    ]])
    return NextResponse.json({ ok: true, total })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
