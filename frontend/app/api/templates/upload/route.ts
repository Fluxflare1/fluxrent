// frontend/app/api/templates/upload/route.ts
import { NextResponse } from "next/server"
import formidable from "formidable"
import fs from "fs"
import { uploadToDrive } from "../../../../lib/drive"
import { addTemplate } from "../../../../lib/googleSheets"

// Updated config format for Next.js 13+
export const config = {
  api: {
    bodyParser: false,
  },
}

function parseForm(req: Request) {
  const form = new formidable.IncomingForm()
  return new Promise<{ fields: any; files: any }>((resolve, reject) => {
    form.parse(req as any, (err, fields, files) => {
      if (err) return reject(err)
      resolve({ fields, files })
    })
  })
}

async function readFile(file: any) {
  if (file.filepath) {
    return fs.promises.readFile(file.filepath)
  }
  if (file.buffer) return file.buffer
  throw new Error("Unable to read uploaded file")
}

export async function POST(req: Request) {
  try {
    const { fields, files } = await parseForm(req)
    const file = files?.file
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    
    const buffer = await readFile(file)
    const filename = fields?.name || file.originalFilename || file.newFilename || `template_${Date.now()}`
    const mimeType = file.mimetype || file.type || "application/octet-stream"
    
    const driveFile = await uploadToDrive(filename, mimeType, buffer)
    const tpl = await addTemplate({ 
      id: `tpl_${Date.now()}`, 
      name: filename, 
      drive_link: driveFile.webViewLink || driveFile.webContentLink || `https://drive.google.com/file/d/${driveFile.id}/view` 
    })
    
    return NextResponse.json({ ok: true, template: tpl, driveFile })
  } catch (err: any) {
    console.error("templates/upload error", err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
