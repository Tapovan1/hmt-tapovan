"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const getTeachersForAbsent = async (department?: string) => {
  const indianDateString = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });

  const today = new Date(indianDateString);

  const whereClause = {
    ...(department && { department }),
    NOT: {
      attendances: {
        some: {
          date: today,
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
