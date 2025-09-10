import { NextResponse } from "next/server"
import { recordPayment } from "../../../lib/googleSheets"

export async function POST(req: Request) {
  const data = await req.json()
  const payment = await recordPayment(data)
  return NextResponse.json(payment)
}
