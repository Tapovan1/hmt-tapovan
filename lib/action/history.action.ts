"use server";

import prisma from "@/lib/prisma";

import { format } from "date-fns";

import { unstable_cache } from "next/cache";

export type AttendanceFilter = {
  status?: string;
  startDate?: Date;
  endDate?: Date;
  userId?: string;
};

export const getAttendanceHistory = unstable_cache(
  async (user, month, year) => {
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
      });
    }

    return attendanceRecords;
  },
  [`dashboard-stats-${format(new Date(), "yyyy-MM-dd")}`],
  { revalidate: 365 * 24 * 60 * 60 }
);
