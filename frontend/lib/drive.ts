import { google } from "googleapis";

export async function copyFile(fileId: string, newTitle: string) {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  const drive = google.drive({ version: "v3", auth });
  const res = await drive.files.copy({
    fileId,
    requestBody: { name: newTitle },
  });

  return res.data;
}
