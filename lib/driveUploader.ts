import { google } from "googleapis";
import fs from "fs";
import path from "path";

const KEYFILE_PATH = path.join(process.cwd(), "service-account.json");

const FOLDERS = {
  hmt: "1ctQAFKDXeEaqoMdlb2Gdxy4WN2Ma-QfF",
  talod: "1ZQdtBWuiTz9gNQeNnpPHoYnzyCdhHVmU",
};

export async function uploadToDrive(
  filePath: string,
  fileName: string,
  type: "hmt" | "talod"
) {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILE_PATH,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  const drive = google.drive({ version: "v3", auth });

  const folderId = FOLDERS[type];

  // Step 1: Delete old files (older than 3 days)
  const oldFiles = await drive.files.list({
    q: `'${folderId}' in parents`,
    fields: "files(id, name, createdTime)",
  });

  const now = new Date();

  for (const file of oldFiles.data.files || []) {
    const createdTime = new Date(file.createdTime!);
    const ageInDays =
      (now.getTime() - createdTime.getTime()) / (1000 * 60 * 60 * 24);

    if (ageInDays > 3) {
      try {
        await drive.files.delete({ fileId: file.id! });
        console.log(`Deleted old backup: ${file.name}`);
      } catch (e) {
        console.warn(`Failed to delete file ${file.name}:`, e);
      }
    }
  }

  // Step 2: Upload the new file
  const fileMetadata = {
    name: fileName,
    parents: [folderId],
  };

  const media = {
    mimeType: "application/octet-stream",
    body: fs.createReadStream(filePath),
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: "id",
  });

  return response.data.id;
}
