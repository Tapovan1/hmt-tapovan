import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const pendingleaves = await prisma.teacherLeave.findMany({
      where: {
        status: "PENDING",
      },
    });

    return NextResponse.json({ pendingleaves });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
