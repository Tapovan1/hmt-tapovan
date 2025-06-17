"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const getTeachersForAbsent = async (department?: string) => {
  const indianDateString = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });

  const today = new Date(indianDateString);

  const currentUtcTime = new Date();
  const indiaOffset = 330;
  const indiaTime = new Date(currentUtcTime.getTime() + indiaOffset * 60000);

  const formattedIndianDate = new Date(indianDateString);
  
  //skip logic if date today is sunday

  const dayOfWeek = today.getDay();
  if (dayOfWeek === 0) {
    return []; // No teachers to mark absent on Sunday
  }

  const whereClause = {
    ...(department && { department }),
    role:{
      not:"SUPERADMIN"
    },
    NOT: {
      attendances: {
        some: {
          date:formattedIndianDate,
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

export const markTeachersAbsent = async (teacherIds: string[]) => {
  const indianDateString = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
  const today = new Date(indianDateString);

  // Check if the date is a Sunday
  const dayOfWeek = today.getDay();
  if (dayOfWeek === 0) {
    return []; // No teachers to mark absent on Sunday
  }

  const absentRecords = await prisma.attendance.createMany({
    data: teacherIds.map((userId) => ({
      userId,
      date: today,
      status: "ABSENT",
      checkIn: null,
      checkOut: null,
    })),
    skipDuplicates: true,
  });

  revalidatePath("/absent");
  revalidatePath("/dashboard");

  return absentRecords;
};
