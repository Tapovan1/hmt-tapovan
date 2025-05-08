"use server";

import prisma from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";
import { calculateMonthlyWorkHours } from "@/lib/utils/time-calculations";

export const getDashboardStats = async (
  userId: string,
  month?: number,
  year?: number
) => {
  const currentDate = new Date();
  const selectedMonth = month ? month - 1 : currentDate.getUTCMonth(); // Month is 0-based in Date.UTC
  const selectedYear = year || currentDate.getUTCFullYear();

  const monthStart = new Date(Date.UTC(selectedYear, selectedMonth, 1)); // Correct start of the month
  const monthEnd = new Date(
    Date.UTC(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999)
  ); // Correct end of the month

  // Today's date formatted correctly
  const indianDateString = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
  const formattedIndianDate = new Date(indianDateString);

  // Get today's attendance
  const todayAttendance = await prisma.attendance.findFirst({
    where: {
      userId: userId,
      date: formattedIndianDate,
    },
  });

  // Get monthly attendance stats for the selected month
  const monthlyAttendance = await prisma.attendance.findMany({
    where: {
      userId,
      date: {
        gte: monthStart,
        lte: monthEnd,
      },
    },
    select: {
      date: true,
      status: true,
      checkIn: true,
      checkOut: true,
    },
  });

  const totalDays = monthlyAttendance.length;
  const presentDays = monthlyAttendance.filter(
    (a: { status: string }) => a.status === "PRESENT"
  ).length;
  const lateDays = monthlyAttendance.filter(
    (a: { status: string }) => a.status === "LATE"
  ).length;
  const absentDays = monthlyAttendance.filter(
    (a: { status: string }) => a.status === "ABSENT"
  ).length;
  const leaveDays = monthlyAttendance.filter(
    (a: { status: string }) => a.status === "ON_LEAVE"
  ).length;

  const totalWorkHours = calculateMonthlyWorkHours(monthlyAttendance);

  // Get recent attendance records
  const recentAttendance = await prisma.attendance.findMany({
    where: {
      userId,
    },
    orderBy: {
      date: "desc",
    },
    take: 5,
  });

  return {
    todayStatus: todayAttendance?.status || "NOT_MARKED",
    monthlyStats: {
      totalDays,
      presentDays,
      thisMonth: presentDays + lateDays,
      lateDays,
      absentDays,
      leaveDays,
      totalWorkHours,
    },
    recentAttendance,
  };
};

// Include month and year in the cache key

export async function getAdminDashboardStats() {
  const today = new Date();
  const startOfToday = startOfDay(today);
  const endOfToday = endOfDay(today);

  const totalEmployees = await prisma.user.count({
    where: {
      NOT: {
        role: {
          in: ["ADMIN", "SUPERADMIN"],
        },
      },
    },
  });

  const todayAttendance = await prisma.attendance.findMany({
    where: {
      date: today,
    },
  });

  const presentToday = todayAttendance.filter(
    (a: { status: string }) => a.status === "PRESENT"
  ).length;
  const lateToday = todayAttendance.filter(
    (a: { status: string }) => a.status === "LATE"
  ).length;
  const absentToday = todayAttendance.filter(
    (a: { status: string }) => a.status === "ABSENT"
  ).length;

  const recentActivities = await prisma.attendance.findMany({
    where: {
      date: {
        gte: startOfToday,
        lte: endOfToday,
      },
    },
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
    take: 10,
  });

  return {
    totalEmployees,
    todayStats: {
      present: presentToday,
      late: lateToday,
      absent: absentToday,
    },
    recentActivities,
  };
}
