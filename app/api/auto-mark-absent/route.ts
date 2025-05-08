// app/api/auto-mark-absent/route.ts
import { NextResponse } from "next/server";
import {
  markTeachersAbsent,
  getTeachersForAbsent,
} from "@/lib/action/absent.action";

export async function GET() {
  try {
    const teachers = await getTeachersForAbsent();
    const teacherIds = teachers.map((t: { id: string }) => t.id);

    if (teacherIds.length > 0) {
      await markTeachersAbsent(teacherIds);
      return NextResponse.json({
        message: `Absent marked for ${teacherIds.length} teachers`,
      });
    } else {
      return NextResponse.json({
        message: "All teachers already marked",
      });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
