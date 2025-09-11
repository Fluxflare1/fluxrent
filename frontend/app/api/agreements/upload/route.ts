import { NextResponse } from "next/server"
import formidable from "formidable"
import fs from "fs"
import { uploadToDrive } from "../../../../lib/drive"
import { updateTenantKyc } from "../../../../lib/googleSheets"

// This config format is correct for Next.js 13+
export const config = {
  api: {
    bodyParser: false
  },
}

function parseForm(req: Request): Promise<{ fields: any; files: any }> {
  const form = new formidable.IncomingForm()
  return new Promise((resolve, reject) => {
    form.parse(req as any, (err, fields, files) => {
      if (err) return reject(err)
      resolve({ fields, files })
    })
  })
}

async function readFileAsBuffer(file: any): Promise<Buffer | null> {
  if (!file) return null
  if (Buffer.isBuffer(file)) return file
  if (typeof file === 'string') {
    return fs.promises.readFile(file)
  }
  if (file.filepath) {
    return fs.promises.readFile(file.filepath)
  }
  if (file.buffer && Buffer.isBuffer(file.buffer)) {
    return file.buffer
  }
  return null
}

export async function POST(req: Request) {
  try {
    const { fields, files } = await parseForm(req)
    const file = files?.file || files?.File || files?.upload || null
    const tenantId = (fields?.tenant_id || fields?.tenant || '').toString()
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }
    if (!tenantId) {
      return NextResponse.json({ error: "tenant_id is required" }, { status: 400 })
    }

    const buffer = await readFileAsBuffer(file)
    if (!buffer) {
      return NextResponse.json({ error: "Failed to read uploaded file" }, { status: 500 })
    }

    const filename = file.originalFilename || file.newFilename || `kyc_${tenantId}_${Date.now()}`
    const mimeType = file.mimetype || file.type || "application/octet-stream"

    const driveFile = await uploadToDrive(filename, mimeType, buffer)
    const link = driveFile.webViewLink || driveFile.webContentLink || `https://drive.google.com/file/d/${driveFile.id}/view`

    await updateTenantKyc(tenantId, link)

    return NextResponse.json({ 
      ok: true, 
      link,
      fileId: driveFile.id,
      message: "KYC document uploaded successfully" 
    })
  } catch (err: any) {
    console.error("agreements/upload error:", err)
    return NextResponse.json({ 
      error: err.message || "Internal server error" 
    }, { status: 500 })
  }
}
