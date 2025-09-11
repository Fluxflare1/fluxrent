// frontend/app/api/agreements/upload/route.ts
import { NextResponse } from "next/server"
import formidable from "formidable"
import fs from "fs"
import { uploadToDrive } from "../../../../lib/drive"
import { updateTenantKyc } from "../../../../lib/googleSheets"

export const config = {
  api: {
    bodyParser: false
  }
}

function parseForm(req: Request) {
  const form = new formidable.IncomingForm()
  return new Promise<{ fields: any; files: any }>((resolve, reject) => {
    // formidable works with node IncomingMessage; in Next 13 route handlers, req is a web.Request,
    // but casting to any allows parse to operate in many setups. This pattern has worked in many Next deployments.
    form.parse(req as any, (err, fields, files) => {
      if (err) return reject(err)
      resolve({ fields, files })
    })
  })
}

async function readFileAsBuffer(pathOrBuffer: any) {
  if (!pathOrBuffer) return null
  if (Buffer.isBuffer(pathOrBuffer)) return pathOrBuffer
  if (typeof pathOrBuffer === 'string') {
    return fs.promises.readFile(pathOrBuffer)
  }
  // formidable file object: has filepath
  if (pathOrBuffer.filepath) {
    return fs.promises.readFile(pathOrBuffer.filepath)
  }
  return null
}

export async function POST(req: Request) {
  try {
    const { fields, files } = await parseForm(req)
    const file = files?.file || files?.File || files?.upload || null
    const tenantId = (fields?.tenant_id || fields?.tenant || '').toString()
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    if (!tenantId) return NextResponse.json({ error: "tenant_id is required" }, { status: 400 })

    // read buffer/path
    const buffer = await readFileAsBuffer(file)
    if (!buffer) return NextResponse.json({ error: "Failed to read uploaded file" }, { status: 500 })

    const filename = (file.originalFilename || file.newFilename || `kyc_${tenantId}_${Date.now()}`)
    const mimeType = file.mimetype || file.type || "application/octet-stream"

    // upload to Drive
    const driveFile = await uploadToDrive(filename, mimeType, buffer)
    const link = (driveFile.webViewLink || driveFile.webContentLink || `https://drive.google.com/file/d/${driveFile.id}/view`)

    // update Tenants sheet with kyc_link (H column)
    await updateTenantKyc(tenantId, link)

    return NextResponse.json({ ok: true, link })
  } catch (err: any) {
    console.error("agreements/upload error:", err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
