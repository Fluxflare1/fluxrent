// frontend/lib/drive.ts
import { google } from "googleapis";

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
}

export async function copyFile(fileId: string, newTitle: string) {
  const auth = getAuth();
  const drive = google.drive({ version: "v3", auth });
  const res = await drive.files.copy({
    fileId,
    requestBody: { name: newTitle },
  });
  return res.data;
}

export async function uploadToDrive(name: string, mimeType: string, body: any) {
  const auth = getAuth();
  const drive = google.drive({ version: "v3", auth });
  const res = await drive.files.create({
    requestBody: { name, mimeType },
    media: { mimeType, body },
    fields: "id, webViewLink",
  });
  return res.data;
}
