import { createAttendanceRecordsForLeave } from "@/lib/action/teacherLeave.action";
import prisma from "@/lib/prisma";
import { createUTCDateOnly } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    const { id } = await params;
    const { status } = await request.json();
     try {
    // Get the leave request
    const leave = await prisma.teacherLeave.findUnique({
      where: { id },
    });

    console.log("Leave:", leave);

    if (!leave) {
      throw new Error("Leave request not found");
    }

    // Update the leave status
    const updatedLeave= await prisma.teacherLeave.update({
      where: { id },
      data: { status },
    });

    const startDate = createUTCDateOnly(leave.startDate);
    const endDate = createUTCDateOnly(leave.endDate);

    // If the leave is approved, create attendance records
    if (status === "APPROVED") {
      //check if attendance records already exist for the leave period
      const attendanceExists = await prisma.attendance.findMany({
        where: {
          userId: leave.userId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      if (attendanceExists.length === 0) {
        await createAttendanceRecordsForLeave(leave);
      }else{
        // Update existing attendance records to "ON_LEAVE"
        for (const record of attendanceExists) {
          if (record.status !== "ON_LEAVE") {
            await prisma.attendance.update({
              where: { id: record.id },
              data: { status: "ON_LEAVE" },
            });
          }
        }
      }
    }

    // If the leave is rejected, delete existing ON_LEAVE attendance records
    if (status === "REJECTED") {
      await prisma.attendance.deleteMany({
        where: {
          userId: leave.userId,
          status: "ON_LEAVE",
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      });
    }

    // Revalidate UI paths to reflect changes
    revalidatePath("/teacher-leaves");
    revalidatePath("/admin/teacher-leaves");
    revalidatePath("/attendance");
     return NextResponse.json({
            success: true,
            data: {
                id: updatedLeave.id,
                userId: updatedLeave.userId,
                name: updatedLeave.name, // Assuming you have a name field
                department: updatedLeave.department,
                status: updatedLeave.status,
                startDate: updatedLeave.startDate,
                endDate: updatedLeave.endDate,
                reason: updatedLeave.reason,
                totalDays: updatedLeave.totalDays,
                createdAt: updatedLeave.createdAt,
                updatedAt: updatedLeave.updatedAt,
                feedback: updatedLeave.feedback,
            }
        });
  } catch (error) {
    console.error("Failed to update leave status:", error);
    return { success: false, error };
  }
}