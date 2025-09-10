import { NextResponse } from "next/server"
import { uploadToDrive } from "../../../../lib/drive"
import formidable from "formidable"

export const config = { api: { bodyParser: false } }

export async function POST(req: Request) {
  // parse multipart with formidable
  const form = new formidable.IncomingForm()
  return new Promise((resolve) => {
    form.parse(req as any, async (err, fields, files) => {
      try {
        if (err) throw err
        // Expect file under 'file' field
        const file = (files as any).file
        if (!file) return resolve(NextResponse.json({ error: "No file uploaded" }, { status: 400 }))
        const data = await uploadToDrive(file.originalFilename || file.newFilename, file.mimetype || "application/octet-stream", file.filepath ? await fsReadFile(file.filepath) : file.buffer)
        resolve(NextResponse.json({ ok: true, file: data }))
      } catch (e) {
        console.error(e)
        resolve(NextResponse.json({ error: e.message }, { status: 500 }))
      }
    })
  })
}

// helper to read file path into Buffer (Node)
import fs from "fs"
function fsReadFile(path: string) {
  return new Promise<Buffer>((resolve, reject) => {
    fs.readFile(path, (err, data) => (err ? reject(err) : resolve(data)))
  })
}
