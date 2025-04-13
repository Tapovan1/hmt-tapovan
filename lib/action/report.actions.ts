"use server";
import prisma from "@/lib/prisma";
import { calculateMonthlyWorkHours } from "@/lib/utils/time-calculations";
import { getSchedulesByDepartment } from "./work-schedule";
import { Status } from "@prisma/client";

export interface ReportData {
  user: {
    id: string;
    name: string;
    department: string;
  };
  stats: {
    presentCount: number;
    absentCount: number;
    lateCount: number;
    totalWorkHours: string;
  };
  dailyAttendance: {
    date: Date;
    status: Status;
    minutesLate: number;
    checkIn: Date | null;
    checkOut: Date | null;
  }[];
}

export async function getReportData(params: {
  department?: string;
  start?: Date;
  end?: Date;
  page?: number;
}) {
  const { department, start, end, page = 1 } = params;
  const itemsPerPage = 10;

  const startDate = start ? new Date(start) : new Date();
  const endDate = end ? new Date(end) : new Date();

  // If dates are provided, adjust them to cover the full day in local timezone
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  // Query users
  const usersQuery = {
    where: department ? { department } : {},
    skip: (page - 1) * itemsPerPage,
    take: itemsPerPage,
  };

  const [users, totalUsers] = await Promise.all([
    prisma.user.findMany(usersQuery),
    prisma.user.count({ where: usersQuery.where }),
  ]);

  // Get attendance data for each user
  const reportData: ReportData[] = await Promise.all(
    users.map(async (user) => {
      // Get department schedule
      const schedule = await getSchedulesByDepartment(user.department);

      const attendanceQuery = {
        where: {
          userId: user.id,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          date: "asc" as const,
        },
      };

      const attendance = await prisma.attendance.findMany(attendanceQuery);

      const transformedAttendance = attendance.map((att) => {
        // Calculate minutes late
        let minutesLate = 0;
        if (att.checkIn && schedule) {
          const expectedStartTime = new Date(att.date);
          const [startHour, startMinute] = schedule.startTime
            .split(":")
            .map(Number);
          expectedStartTime.setHours(
            startHour,
            startMinute + schedule.graceMinutes,
            0,
            0
          ); // Add grace period
          expectedStartTime.setTime(
            expectedStartTime.getTime() -
              expectedStartTime.getTimezoneOffset() * 60000
          ); // Adjust for local timezone
          const diff =
            (att.checkIn.getTime() - expectedStartTime.getTime()) / 60000; // Convert milliseconds to minutes
          minutesLate = diff > 0 ? diff : 0;
        }

        return {
          date: att.date,
          status: att.status,
          minutesLate,
          checkIn: att.checkIn,
          checkOut: att.checkOut,
        };
      });

      // Calculate statistics directly from transformed attendance data
      const stats = transformedAttendance.reduce(
        (acc, curr) => {
          if (curr.status === Status.PRESENT) {
            acc.presentCount++;
          } else if (curr.status === Status.ABSENT) {
            acc.absentCount++;
          } else if (curr.status === Status.LATE) {
            acc.lateCount++;
          }
          return acc;
        },
        { presentCount: 0, absentCount: 0, lateCount: 0 }
      );

      // Calculate total work hours
      const totalWorkHours = calculateMonthlyWorkHours(attendance);

      return {
        user: {
          id: user.id,
          name: user.name,
          department: user.department,
        },
        stats: {
          ...stats,
          totalWorkHours,
        },
        dailyAttendance: transformedAttendance,
      };
    })
  );

  return {
    data: reportData,
    totalPages: Math.ceil(totalUsers / itemsPerPage),
  };
}

export async function getDepartments() {
  // Get unique departments from users who are teachers
  const departments = await prisma.user.findMany({
    where: {
      NOT: {
        role: {
          in: ["ADMIN", "SUPERADMIN"],
        },
      },
    },
    select: {
      department: true,
    },
    distinct: ["department"],
  });

  // Transform the data to match the expected format
  return departments.map((dept: { department: string }) => ({
    id: dept.department,
    name: dept.department,
  }));
}
