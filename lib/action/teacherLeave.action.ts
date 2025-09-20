"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";

// Import your auth session handler
// This is a placeholder - replace with your actual auth imports

import { getUser } from "./getUser";
import { createUTCDateOnly, generateDateRange } from "../utils";

//function to get pending leaves
export async function getPendingLeaves() {
  try {
    const leaves = await prisma.teacherLeave.findMany({
      where: {
        status: "PENDING",
      },
      orderBy: {
        startDate: "desc",
      },
    });

    return leaves;
  } catch (error) {
    console.error("Failed to fetch pending leaves:", error);
    return [];
  }
}

export async function getTeacherLeaves(month: number, year: number) {
  const user = await getUser();
  if (!user) {
    throw new Error("User not authenticated");
  }
  const startDate = startOfMonth(new Date(year, month - 1));
  const endDate = endOfMonth(new Date(year, month - 1));
  console.log("Fetching leaves for:", {
    userId: user.id,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });

  try {
    const leaves = await prisma.teacherLeave.findMany({
      where: {
        userId: user.id,
        OR: [
          {
            startDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            endDate: {
              gte: startDate,
              lte: endDate,
            },
          },
        ],
      },
      orderBy: {
        startDate: "desc",
      },
    });

    return leaves;
  } catch (error) {
    console.error("Failed to fetch teacher leaves:", error);
    return [];
  }
}

interface TeacherLeaveData {
  start: string;
  end: string;
  reason: string;
}

export async function createTeacherLeave(data: TeacherLeaveData) {
  const startDate = new Date(Number(data.start));
  const endDate = new Date(Number(data.end));

  // Set time to midnight (00:00:00)
  startDate.setUTCHours(0, 0, 0, 0);
  endDate.setUTCHours(0, 0, 0, 0);

  // Add one day to both dates

  console.log("startDate", startDate);
  console.log("endDate", endDate);

  try {
    // Get the current user from the session
    // This is a placeholder - replace with your actual auth logic
    const user = await getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Check if the leave request overlaps with existing approved leaves
    const existingLeaves = await prisma.teacherLeave.findMany({
      where: {
        userId: user.id,

        OR: [
          {
            startDate: {
              lte: endDate,
            },
            endDate: {
              gte: startDate,
            },
          },
        ],
      },
    });
    if (existingLeaves.length > 0) {
      return {
        success: false,
        message: "Leave request overlaps with existing leaves.",
      };
    }
    const days = generateDateRange(startDate, endDate);
    const totalDays = days.length;

    console.log("totalDays", totalDays);

    const leave = await prisma.teacherLeave.create({
      data: {
        userId: user.id,
        name: user.name,
        department: user.department,
        startDate: startDate,
        endDate: endDate,
        reason: data.reason,
        totalDays: totalDays,
        status: "PENDING",
      },
    });

    const token = await prisma.pushNotificationToken.findFirst({
      where:{
        user_name:"default_user"
      }
    });
    const expoPushToken = token?.token;

    //expo push notiifcation api call send notifiation
    const message = {
    to: expoPushToken, // ExponentPushToken[...] from device
    sound: "default",
    title: "New Leave Request",
    body: `${user.name} - ${user.department} submitted a new leave request`,
 
  };

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    revalidatePath("/teacher-leaves");
    return { success: true, message: "Leave Request Submitted...." };
  } catch (error) {
    console.error("Failed to create teacher leave:", error);
    return { success: false, error, message: error };
  }
}

interface UpdateTeacherLeaveData {
  id: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: string;
}

export async function updateTeacherLeave(data: UpdateTeacherLeaveData) {
  try {
    const leave = await prisma.teacherLeave.update({
      where: {
        id: data.id,
      },
      data: {
        startDate: data.startDate,
        endDate: data.endDate,
        reason: data.reason,
        status: data.status,
      },
    });

    revalidatePath("/teacher-leaves");
    return {
      success: true,
      data: leave,
      message: "Leave Request Updated Sucessfully...",
    };
  } catch (error) {
    console.error("Failed to update teacher leave:", error);
    return { success: false, error, message: "failed" };
  }
}

export async function updateLeaveStatus(formData: FormData) {
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;

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
    await prisma.teacherLeave.update({
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

    return { success: true };
  } catch (error) {
    console.error("Failed to update leave status:", error);
    return { success: false, error };
  }
}

// Helper function to create attendance records for all days in the leave period

export async function createAttendanceRecordsForLeave(leave: {
  userId: string;
  startDate: Date;
  endDate: Date;
}) {
  const userId = leave.userId;

  // Create clean UTC dates at 00:00:00 for start and end dates
  const startDate = createUTCDateOnly(leave.startDate);
  const endDate = createUTCDateOnly(leave.endDate);

  // Step 1: Fetch existing attendance
  const existingAttendances = await prisma.attendance.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const existingMap = new Map<
    string,
    { id: string; date: Date; status: string }
  >();
  existingAttendances.forEach((record) => {
    const dateKey = record.date.toISOString().split("T")[0];
    existingMap.set(dateKey, record);
  });

  // Step 2: Generate dates between start and end (inclusive)
  const datesInRange = generateDateRange(startDate, endDate);

  // Step 3: Create or update attendance records
  for (const date of datesInRange) {
    const dateOnlyStr = date.toISOString().split("T")[0];

    if (existingMap.has(dateOnlyStr)) {
      const existing = existingMap.get(dateOnlyStr);

      if (existing?.status !== "ON_LEAVE") {
        await prisma.attendance.update({
          where: { id: existing?.id },
          data: { status: "ON_LEAVE" },
        });
      }
    } else {
      await prisma.attendance.create({
        data: {
          userId,
          date: date,
          status: "ON_LEAVE",
        },
      });
    }
  }
}
export async function deleteTeacherLeave(id: string) {
  try {
    await prisma.teacherLeave.delete({
      where: {
        id,
      },
    });

    revalidatePath("/teacher-leaves");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete teacher leave:", error);
    return { success: false, error };
  }
}

// Function to check if a teacher is on approved leave for a specific date
export async function isTeacherOnLeave(userId: string, date: Date) {
  try {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    const leaves = await prisma.teacherLeave.findMany({
      where: {
        userId,
        status: "APPROVED",
        startDate: { lte: checkDate },
        endDate: { gte: checkDate },
      },
    });

    return leaves.length > 0 ? leaves[0] : null;
  } catch (error) {
    console.error("Error checking teacher leave status:", error);
    return null;
  }
}

// Function to get all leave days for a teacher within a date range
export async function getTeacherLeaveDays(
  userId: string,
  startDate: Date,
  endDate: Date,
) {
  try {
    const leaves = await prisma.teacherLeave.findMany({
      where: {
        userId,
        status: "APPROVED",
        OR: [
          {
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
        ],
      },
    });

    // Create an array of all leave days
    const leaveDays: Date[] = [];

    leaves.forEach((leave) => {
      const leaveStart = new Date(
        Math.max(leave.startDate.getTime(), startDate.getTime()),
      );
      const leaveEnd = new Date(
        Math.min(leave.endDate.getTime(), endDate.getTime()),
      );

      const currentDate = new Date(leaveStart);
      while (currentDate <= leaveEnd) {
        leaveDays.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    return leaveDays;
  } catch (error) {
    console.error("Error getting teacher leave days:", error);
    return [];
  }
}
