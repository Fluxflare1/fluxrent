// frontend/lib/drive.ts
import { google } from "googleapis"
import stream from "stream"
import fs from "fs"

function getAuthClient() {
  const credentials = {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")
  }
  if (!credentials.client_email || !credentials.private_key) {
    throw new Error("Google credentials not configured in env variables.")
  }
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/drive"
    ],
  })
  return auth
}

export async function uploadToDrive(filename: string, mimeType: string, bufferOrFilePath: Buffer | string, parents?: string[]) {
  const auth = getAuthClient()
  const drive = google.drive({ version: "v3", auth })

  let fileBody: stream.Readable
  if (Buffer.isBuffer(bufferOrFilePath)) {
    const passthrough = new stream.PassThrough()
    passthrough.end(bufferOrFilePath)
    fileBody = passthrough
  } else {
    fileBody = fs.createReadStream(bufferOrFilePath)
  }

  const folderId = parents && parents.length ? parents : (process.env.GOOGLE_DRIVE_FOLDER_ID ? [process.env.GOOGLE_DRIVE_FOLDER_ID] : undefined)

  const res = await drive.files.create({
    requestBody: {
      name: filename,
      mimeType,
      parents: folderId
    },
    media: {
      mimeType,
      body: fileBody
    },
    fields: "id, name, mimeType, webViewLink, webContentLink"
  })

  try {
    await drive.permissions.create({
      fileId: res.data.id!,
      requestBody: {
        role: "reader",
        type: "anyone"
      }
    })
  } catch (err) {
    console.warn("drive: permission set failed:", (err as any)?.message || err)
  }

  const file = await drive.files.get({ fileId: res.data.id!, fields: "id, name, webViewLink, webContentLink, mimeType" })
  return file.data
}
