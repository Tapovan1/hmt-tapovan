import { NextRequest, NextResponse } from "next/server";
import { uploadToDrive } from "@/lib/driveUploader";
import path from "path";
import fs from "fs";

export async function POST(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  const { type } = params;

  if (type !== "hmt" && type !== "talod") {
    return NextResponse.json({ error: "Invalid db type" }, { status: 400 });
  }

  const searchParams = request.nextUrl.searchParams;
  const filename = searchParams.get("filename");

  if (!filename) {
    return NextResponse.json({ error: "Missing filename" }, { status: 400 });
  }

  const filePath = path.join("/tmp", filename);

  try {
    // Ensure file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "File not found on server" },
        { status: 404 }
      );
    }

    // Upload to Drive
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
