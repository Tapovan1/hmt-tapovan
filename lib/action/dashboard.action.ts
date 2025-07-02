"use server";

import prisma from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

export const getDashboardStats = async (
  userId: string,
  month?: number,
  year?: number
) => {
  // console.log("userId", userId);
  // console.log("month", month);
  // console.log("year", year);

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
  // console.log("formattedIndianDate",formattedIndianDate);

  const currentUtcTime = new Date();
  const indiaOffset = 330;
  const indiaTime = new Date(currentUtcTime.getTime() + indiaOffset * 60000);
  const indiaDateOnly = new Date(indiaTime);
  indiaDateOnly.setHours(0, 0, 0, 0);

  // Get today's attendance
  const todayAttendance = await prisma.attendance.findFirst({
    where: {
      userId: userId,
      date: formattedIndianDate,
    },
  });
  // console.log("todayAttendance",todayAttendance);

  // console.log("formattedIndianDate",formattedIndianDate);

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
      late: true,
    },
  });

  //count total days in month and return value exclude sunday
  const totalDaysInMonth = new Date(
    selectedYear,
    selectedMonth + 1,
    0
  ).getDate(); // Get the last date of the month
  const totalDaysInMonthArray = Array.from(
    { length: totalDaysInMonth },
    (_, i) => new Date(selectedYear, selectedMonth, i + 1)
  );
  const totalDays = totalDaysInMonthArray.filter((date) => {
    const dayOfWeek = date.getDay();
    return dayOfWeek !== 0; // Exclude Sundays (0)
  }).length;

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

  // const totalWorkHours = calculateMonthlyWorkHours(monthlyAttendance);
  //caclulate total late minute count in db alrdy have late filed minute add all
  const totalMinuteLate = monthlyAttendance.reduce(
    (acc: number, curr: { late: number | null }) => acc + (curr.late ?? 0),
    0
  );

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
      totalMinuteLate,
    },
    recentAttendance,
  };
};

// Include month and year in the cache key

export async function getAdminDashboardStats() {
  const currentUtcTime = new Date();
  const indiaOffset = 330;
  const indiaTime = new Date(currentUtcTime.getTime() + indiaOffset * 60000);
  // console.log("indiaTime", indiaTime);

  const indiaDateOnly = new Date(indiaTime);
  indiaDateOnly.setHours(0, 0, 0, 0);
  // console.log(indiaDateOnly);

  const indianDateString = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });

  const formattedIndianDate = new Date(indianDateString);

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
      date: formattedIndianDate,
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
      date: formattedIndianDate,
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
