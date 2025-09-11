// frontend/app/api/templates/route.ts
import { NextResponse } from "next/server"
import { getTemplates } from "../../../lib/googleSheets"

export async function GET() {
  try {
    const templates = await getTemplates()
    return NextResponse.json(templates)
  } catch (err:any) {
    console.error("GET /api/templates error", err)
    return NextResponse.json({ error: err.message || 'Failed' }, { status: 500 })
  }
}
