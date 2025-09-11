// frontend/app/api/agreements/assign/route.ts
import { NextResponse } from "next/server"
import { copyFile } from "../../../../lib/drive"
import { addAgreement } from "../../../../lib/googleSheets"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    // body: { template_id, template_drive_file_id, tenant_id, copy_name (optional) }
    if (!body || !body.template_drive_file_id || !body.tenant_id) {
      return NextResponse.json({ error: 'template_drive_file_id and tenant_id required' }, { status: 400 })
    }
    const newName = body.copy_name || `Agreement-${body.tenant_id}-${Date.now()}`
    const copied = await copyFile(body.template_drive_file_id, newName)
    const driveLink = copied.webViewLink || copied.webContentLink || `https://drive.google.com/file/d/${copied.id}/view`
    const agreement = await addAgreement({ tenant_id: body.tenant_id, template_id: body.template_id || '', drive_link: driveLink })
    return NextResponse.json({ ok: true, agreement, driveFile: copied })
  } catch (err:any) {
    console.error("agreements/assign error", err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
