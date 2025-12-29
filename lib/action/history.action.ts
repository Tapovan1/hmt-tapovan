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
    select: {
      id: true,
      date: true,
      checkIn: true,
      checkOut: true,
      status: true,
      late: true,
      early: true,
      userId: true,
      // Exclude photo field to improve performance
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
  const selectedMonth = month ? month - 1 : currentDate.getUTCMonth(); // 0-based
  const selectedYear = year || currentDate.getUTCFullYear();

  const monthStart = new Date(Date.UTC(selectedYear, selectedMonth, 1));
  const monthEnd = new Date(
    Date.UTC(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999)
  );

  // 1. Fetch attendance only for the selected month
  let attendanceRecords;
  if (user?.role === "ADMIN") {
    attendanceRecords = await prisma.attendance.findMany({
      where: { date: { gte: monthStart, lte: monthEnd } },
      include: { user: { select: { name: true } } },
      orderBy: { date: "desc" },
    });
  } else {
    attendanceRecords = await prisma.attendance.findMany({
      where: {
        userId: user?.id,
        date: { gte: monthStart, lte: monthEnd },
      },
      orderBy: { date: "asc" },
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

  // 2. Fetch holidays for this month
  const holidays = await prisma.holiday.findMany({
    where: { date: { gte: monthStart, lte: monthEnd } },
    select: { date: true, name: true },
  });

  // 3. Generate Sundays only (don’t generate all days)
  const sundays: { date: Date }[] = [];
  let d = new Date(monthStart);
  while (d <= monthEnd) {
    if (d.getUTCDay() === 0) {
      sundays.push({ date: new Date(d) });
    }
    d.setUTCDate(d.getUTCDate() + 1);
  }

  // 4. Merge data
  const finalRecords: {
    date: Date;
    type: "WORKING" | "SUNDAY" | "HOLIDAY";
    holidayName?: string;
    attendance?: any;
  }[] = [];

  // add Sundays
  sundays.forEach((s) => finalRecords.push({ date: s.date, type: "SUNDAY" }));

  // add holidays
  holidays.forEach((h) =>
    finalRecords.push({
      date: h.date,
      type: "HOLIDAY",
      holidayName: h.name,
    })
  );

  // add attendance
  attendanceRecords.forEach((a: any) =>
    finalRecords.push({
      date: a.date,
      type: "WORKING",
      attendance: a,
    })
  );

  // 5. Sort by date (ascending to match your UI)
  finalRecords.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return finalRecords;
};
