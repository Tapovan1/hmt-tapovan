"use server";

import prisma from "@/lib/prisma";

export async function getAttendancePhoto(attendanceId: string) {
  try {
    const attendance = await prisma.attendance.findUnique({
      where: { id: attendanceId },
      select: { photo: true },
    });

    return {
      success: true,
      photo: attendance?.photo || null,
    };
  } catch (error) {
    console.error("Error fetching attendance photo:", error);
    return {
      success: false,
      photo: null,
      error: "Failed to fetch photo",
    };
  }
}
