"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const getTeachersForAbsent = async (
  department?: string,
  selectedDate?: string
) => {
  console.log("selectedDate:", selectedDate);

  // Use selected date or default to today
  let targetDate: Date;

  if (selectedDate) {
    targetDate = new Date(selectedDate);
  } else {
    const indianDateString = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    });
    targetDate = new Date(indianDateString);
  }

  // Skip logic if selected date is Sunday
  const dayOfWeek = targetDate.getDay();
  if (dayOfWeek === 0) {
    return []; // No teachers to mark absent on Sunday
  }

  const whereClause = {
    ...(department && { department }),
    role: {
      not: "SUPERADMIN",
    },
    NOT: {
      attendances: {
        some: {
          date: targetDate,
        },
      },
    },
  };

  const teachers = await prisma.user.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      email: true,
      department: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  if (!teachers || teachers.length === 0) {
    return []; // No teachers found for the given department
  }

  return teachers;
};

export const markTeachersAbsent = async (
  teacherIds: string[],
  selectedDate?: string
) => {
  // Use selected date or default to today
  let targetDate: Date;

  if (selectedDate) {
    targetDate = new Date(selectedDate);
  } else {
    const indianDateString = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    });
    targetDate = new Date(indianDateString);
  }

  // Check if the date is a Sunday
  const dayOfWeek = targetDate.getDay();
  if (dayOfWeek === 0) {
    return { success: false, message: "Cannot mark absent on Sunday" };
  }

  //check also if alredy have
  const isHoliday = await prisma.holiday.findFirst({
    where : {
      date: targetDate
    }
  });

  if (isHoliday) {
    return { success: false, message: "Cannot mark absent on a holiday" };
  }

  try {
    const absentRecords = await prisma.attendance.createMany({
      data: teacherIds.map((userId) => ({
        userId,
        date: targetDate,
        status: "ABSENT",
        checkIn: null,
        checkOut: null,
      })),
      skipDuplicates: true,
    });

    revalidatePath("/absent");
    revalidatePath("/dashboard");

    return { success: true, count: absentRecords.count };
  } catch (error) {
    console.error("Error marking teachers absent:", error);
    return { success: false, message: "Failed to mark teachers absent" };
  }
};
