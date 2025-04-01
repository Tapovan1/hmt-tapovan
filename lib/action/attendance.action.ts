"use server";

import prisma from "@/lib/prisma";
import { revalidatePath, unstable_cache } from "next/cache";
import { getUser } from "./getUser";

import { format } from "date-fns";
import { determineStatus } from "../attendance";
import { getSchedulesByDepartment } from "./work-schedule";

const currentUtcTime = new Date();

const formattedIndianDate = new Date(format(currentUtcTime, "yyyy-MM-dd"));

export const getWorkSchedule = unstable_cache(
  async () => {
    // Fallback to global schedule
    const globalSchedule = await prisma.workSchedule.findFirst({
      where: { isGlobal: true },
    });

    if (!globalSchedule) {
      throw new Error("No work schedule found");
    }

    return globalSchedule;
  },
  ["workSchedule"],
  { revalidate: 86400 }
);

export async function markAttendance(data: { photo: string }) {
  const user = await getUser();

  const currentUtcTime = new Date();
  const indiaOffset = 330;

  const indiaTime = new Date(currentUtcTime.getTime() + indiaOffset * 60000);

  const existingAttendance = await prisma.attendance.findFirst({
    where: {
      userId: user?.id,
      date: currentUtcTime,
    },
  });

  if (existingAttendance) {
    return {
      sucess: false,
      message: "Attendance already marked for the day",
    };
  }

  if (!user?.department) {
    throw new Error("Department is required to mark attendance");
  }

  const schedule = await getSchedulesByDepartment(user.department);

  if (!schedule) {
    throw new Error("No schedule found for the department");
  }

  await prisma.attendance.create({
    data: {
      userId: user.id,

      date: formattedIndianDate,
      checkIn: indiaTime,
      photo: data.photo,
      status: determineStatus(indiaTime, schedule),
    },
  });

  revalidatePath("/attendance");
  revalidatePath("/dashboard");
  revalidatePath("/history");

  return {
    sucess: true,
    message: "Attendance marked successfully",
  };
}

export async function markCheckOut(data: { photo: string }) {
  const user = await getUser();

  const currentUtcTime = new Date();
  const indiaOffset = 330;

  const indiaTime = new Date(currentUtcTime.getTime() + indiaOffset * 60000);

  const existingAttendance = await prisma.attendance.findFirst({
    where: {
      userId: user?.id,
      date: currentUtcTime,
    },
  });

  if (!existingAttendance) {
    return {
      sucess: false,
      message: "Attendance not marked for the day",
    };
  }

  if (existingAttendance.checkOut) {
    return {
      sucess: false,
      message: "Check-out already marked for the day",
    };
  }

  await prisma.attendance.update({
    where: {
      id: existingAttendance.id,
    },
    data: {
      checkOut: indiaTime,
      photo: data.photo,

      // status: determineStatus(indiaTime, schedule),
    },
  });

  revalidatePath("/attendance");
  revalidatePath("/dashboard");
  revalidatePath("/history");

  return {
    sucess: true,
    message: "Check-out marked successfully",
  };
}
export const getAttendance = async (user: { id: string }) => {
  const attendance = await prisma.attendance.findFirst({
    where: {
      userId: user.id,
      date: new Date(),
    },

    select: {
      checkIn: true,
      checkOut: true,
      status: true,
    },
  });

  if (!attendance) {
    return null;
  }

  return {
    ...attendance,
    checkIn: attendance.checkIn?.toISOString(),
    checkOut: attendance.checkOut?.toISOString(),
    status: attendance.status,
  };
};
