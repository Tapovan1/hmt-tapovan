"use server";

import prisma from "@/lib/prisma";

import { unstable_cache } from "next/cache";

export type AttendanceFilter = {
  status?: string;
  startDate?: Date;
  endDate?: Date;
  userId?: string;
};

export const getDepartments = unstable_cache(
  async () => {
    const departments = await prisma.user.findMany({
      select: {
        department: true,
      },
      distinct: ["department"],
    });

    return departments
      .map((d) => d.department)
      .filter((d): d is string => d !== null);
  },
  ["departments"],
  { revalidate: 3600 } // Revalidate every hour
);

export const getTodayAdminAttendance = async (
  department?: string,
  take?: number,
  skip?: number
) => {
  // Get today's date in Indian timezone
  const indianDateString = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
  const formattedIndianDate = new Date(indianDateString);
  // const today = new Date(indianDateString);

  const whereClause = {
    date: formattedIndianDate,
    ...(department && {
      user: {
        department: department,
      },
    }),
  };

  // Get total count for pagination
  const totalCount = await prisma.attendance.count({
    where: whereClause,
  });

  const attendanceRecords = await prisma.attendance.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          name: true,
          department: true,
        },
      },
    },
    orderBy: {
      checkIn: "desc",
    },
    take,
    skip,
  });

  return {
    records: attendanceRecords,
    totalCount,
  };
};

export const getAttendanceHistory = async (
  user: {
    role: string;
    id: string;
    name: string;
    email: string;
    department: string;
  } | null,
  month: number | undefined,
  year: number | undefined
) => {
  const currentDate = new Date();
  const selectedMonth = month ? month - 1 : currentDate.getUTCMonth(); // Month is 0-based in Date.UTC
  const selectedYear = year || currentDate.getUTCFullYear();

  const monthStart = new Date(Date.UTC(selectedYear, selectedMonth, 1)); // Correct start of the month
  const monthEnd = new Date(
    Date.UTC(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999)
  ); // Correct end of the month
  let attendanceRecords;

  if (user?.role === "ADMIN") {
    attendanceRecords = await prisma.attendance.findMany({
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });
  } else {
    attendanceRecords = await prisma.attendance.findMany({
      where: {
        userId: user?.id,
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },

      orderBy: {
        date: "desc",
      },
      select: {
        id: true,
        date: true,
        checkIn: true,
        checkOut: true,
        status: true,
        late: true,
        early: true,
      },
    });
  }

  return attendanceRecords;
};
