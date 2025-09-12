import { google } from "googleapis";
import fs from "fs";

// Initialize auth with proper error handling
function getAuth() {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS || "{}");
    
    if (!credentials.client_email || !credentials.private_key) {
      throw new Error("Google credentials not properly configured");
    }

    return new google.auth.GoogleAuth({
      credentials: {
        ...credentials,
        private_key: credentials.private_key.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/drive.file"],
    });
  } catch (error) {
    throw new Error(`Failed to initialize Google Auth: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function uploadFileToDrive(
  filePath: string, 
  mimeType: string, 
  folderId?: string
): Promise<{ id?: string; webViewLink?: string; webContentLink?: string; name?: string }> {
  try {
    const auth = getAuth();
    const drive = google.drive({ version: "v3", auth: await auth.getClient() });

    const fileName = filePath.split("/").pop() || `file_${Date.now()}`;
    const fileMetadata: any = { name: fileName };
    
    if (folderId) {
      fileMetadata.parents = [folderId];
    }

    const media = { 
      mimeType, 
      body: fs.createReadStream(filePath) 
    };

    const res = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: "id, name, webViewLink, webContentLink, mimeType",
    });

    return res.data;
  } catch (error) {
    console.error("Error uploading file to Drive:", error);
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function getFileFromDrive(
  fileId: string
): Promise<{ id?: string; name?: string; mimeType?: string; webViewLink?: string; webContentLink?: string }> {
  try {
    const auth = getAuth();
    const drive = google.drive({ version: "v3", auth: await auth.getClient() });

    const res = await drive.files.get({
      fileId,
      fields: "id, name, mimeType, webViewLink, webContentLink",
    });

    return res.data;
  } catch (error) {
    console.error("Error getting file from Drive:", error);
    throw new Error(`Failed to get file: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Additional utility functions for better compatibility
export async function copyFile(
  fileId: string, 
  newName: string, 
  destinationFolderId?: string
): Promise<{ id?: string; name?: string }> {
  try {
    const auth = getAuth();
    const drive = google.drive({ version: "v3", auth: await auth.getClient() });

    const fileMetadata: any = { name: newName };
    if (destinationFolderId) {
      fileMetadata.parents = [destinationFolderId];
    }

    const res = await drive.files.copy({
      fileId,
      requestBody: fileMetadata,
      fields: "id, name",
    });

    return res.data;
  } catch (error) {
    console.error("Error copying file in Drive:", error);
    throw new Error(`Failed to copy file: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Export for backward compatibility
export const googleDrive = {
  uploadFile: uploadFileToDrive,
  getFile: getFileFromDrive,
  copyFile: copyFile,
};

export default googleDrive;
