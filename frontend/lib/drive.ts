import { google } from "googleapis"
import stream from "stream"

function getAuth() {
  const credentials = {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")
  }
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive.file", "https://www.googleapis.com/auth/drive"]
  })
  return auth
}

/**
 * Uploads a file to Google Drive under specified folder.
 * @param name filename
 * @param mimeType content-type
 * @param buffer Buffer or string
 * @param parents optional folder id array
 */
export async function uploadToDrive(name: string, mimeType: string, buffer: Buffer | string, parents?: string[]) {
  const auth = getAuth()
  const drive = google.drive({ version: "v3", auth })
  const media = {
    mimeType,
    body: typeof buffer === "string" ? Buffer.from(buffer) : buffer
  }

  // Use a readable stream for large files
  const passthrough = new stream.PassThrough()
  passthrough.end(media.body)

  const res = await drive.files.create({
    requestBody: {
      name,
      mimeType,
      parents: parents || (process.env.GOOGLE_DRIVE_FOLDER_ID ? [process.env.GOOGLE_DRIVE_FOLDER_ID] : undefined)
    },
    media: { body: passthrough },
    fields: "id, name, mimeType, webViewLink, webContentLink"
  })

  // Make file shareable (anyone with link can view) — optional, comment if you prefer restricted sharing
  try {
    await drive.permissions.create({
      fileId: res.data.id!,
      requestBody: {
        role: "reader",
        type: "anyone"
      }
    })
  } catch (e) {
    // permission creation may fail if folder policy restricted; ignore gracefully
    console.warn("drive permission creation failed:", e)
  }

  const file = await drive.files.get({ fileId: res.data.id!, fields: "id, name, webViewLink, webContentLink, mimeType" })
  return file.data
}
