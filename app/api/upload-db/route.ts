import { NextRequest, NextResponse } from "next/server";
import { uploadToDrive } from "@/lib/driveUploader";
import path from "path";

export async function POST(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  const { type } = params;

  if (type !== "hmt" && type !== "talod") {
    return NextResponse.json({ error: "Invalid db type" }, { status: 400 });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `${type}_db_${timestamp}.sql`;
  const filePath = path.join("/tmp", filename); // Adjust if you store elsewhere

  try {
    const fileId = await uploadToDrive(
      filePath,
      filename,
      type as "hmt" | "talod"
    );
    return NextResponse.json(
      { message: "Uploaded successfully", fileId },
      { status: 200 }
    );
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: "Upload failed", detail: err.message },
      { status: 500 }
    );
  }
}
