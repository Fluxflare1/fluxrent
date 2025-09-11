import { google } from "googleapis";
import fs from "fs";

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS || "{}"),
  scopes: ["https://www.googleapis.com/auth/drive.file"],
});

export async function uploadFileToDrive(filePath: string, mimeType: string, folderId?: string) {
  const drive = google.drive({ version: "v3", auth: await auth.getClient() });

  const fileMetadata: any = { name: filePath.split("/").pop() };
  if (folderId) fileMetadata.parents = [folderId];

  const media = { mimeType, body: fs.createReadStream(filePath) };

  const res = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: "id, webViewLink, webContentLink",
  });

  return res.data;
}

export async function getFileFromDrive(fileId: string) {
  const drive = google.drive({ version: "v3", auth: await auth.getClient() });

  const res = await drive.files.get({
    fileId,
    fields: "id, name, mimeType, webViewLink, webContentLink",
  });

  return res.data;
}
