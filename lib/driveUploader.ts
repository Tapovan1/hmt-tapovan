import { google } from "googleapis";
import fs from "fs";
import path from "path";

const KEYFILE_PATH = path.join(process.cwd(), "service-account.json");

const FOLDERS = {
  hmt: "1ctQAFKDXeEaqoMdlb2Gdxy4WN2Ma-QfF", // <-- Replace with your folder ID
  talod: "1ZQdtBWuiTz9gNQeNnpPHoYnzyCdhHVmU", // <-- Replace with your folder ID
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

  const fileMetadata = {
    name: fileName,
    parents: [FOLDERS[type]],
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
