import { NextResponse } from "next/server"
import { getTenants, addTenant } from "../../../lib/googleSheets"

export async function GET() {
  const tenants = await getTenants()
  return NextResponse.json(tenants)
}

export async function POST(req: Request) {
  const data = await req.json()
  const tenant = await addTenant(data)
  return NextResponse.json(tenant)
}
