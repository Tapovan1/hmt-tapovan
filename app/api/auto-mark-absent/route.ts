import { NextResponse } from "next/server";
import {
  markTeachersAbsent,
  getTeachersForAbsent,
} from "@/lib/action/absent.action";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Get all departments that have auto-absent enabled
    const schedulesWithAutoAbsent = await prisma.workSchedule.findMany({
      where: {
        absentAutomation: true,
      },
      select: {
        department: true,
      },
    });

    // Extract departments
    const departmentsWithAutoAbsent = schedulesWithAutoAbsent
      .map((schedule) => schedule.department)
      .filter(
        (dept): dept is string => typeof dept === "string" && dept.length > 0
      );

    if (departmentsWithAutoAbsent.length === 0) {
      return NextResponse.json({
        message: "No departments have automatic absence marking enabled",
      });
    }

    // Get teachers for these departments only
    let markedCount = 0;

    for (const department of departmentsWithAutoAbsent) {
      const teachers = await getTeachersForAbsent(department);
      const teacherIds = teachers.map((t) => t.id);

      if (teacherIds.length > 0) {
        await markTeachersAbsent(teacherIds);
        markedCount += teacherIds.length;
      }
    }

    if (markedCount > 0) {
      return NextResponse.json({
        message: `Absent marked for ${markedCount} teachers in departments with auto-absent enabled`,
      });
    } else {
      return NextResponse.json({
        message:
          "All teachers already marked or no teachers found in auto-absent departments",
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
