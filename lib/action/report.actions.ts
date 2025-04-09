"use server";
import prisma from "@/lib/prisma";
import { Attendance, User } from "@prisma/client";
import { calculateMonthlyWorkHours } from "@/lib/utils/time-calculations";

export type ReportData = {
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
};

export async function getReportData(params: {
  department?: string;
  start?: Date;
  end?: Date;
  page?: number;
  limit?: number;
  all?: boolean;
}): Promise<{
  data: ReportData[];
  total: number;
  totalPages: number;
}> {
  const { department, start, end, page = 1, limit = 20 } = params;

  // Create new Date objects to avoid modifying the original dates
  const startDate = start ? new Date(start) : undefined;
  const endDate = end ? new Date(end) : undefined;

  // If dates are provided, adjust them to cover the full day in local timezone
  if (startDate) {
    // Set to start of day in local timezone
    startDate.setHours(0, 0, 0, 0);
  }
  if (endDate) {
    // Set to end of day in local timezone
    endDate.setHours(23, 59, 59, 999);
  }

  // Get total count of teachers in the department
  const totalTeachers = await prisma.user.count({
    where: {
      department: department,
      NOT: {
        role: {
          in: ["ADMIN", "SUPERADMIN"],
        },
      },
    },
  });

  // Calculate total pages
  const totalPages = Math.ceil(totalTeachers / limit);

  // Get paginated users
  const users = await prisma.user.findMany({
    where: {
      department: department,
      NOT: {
        role: {
          in: ["ADMIN", "SUPERADMIN"],
        },
      },
    },
    ...(params.all
      ? {}
      : {
          skip: (page - 1) * limit,
          take: limit,
        }),
  });

  const reportData: ReportData[] = await Promise.all(
    users.map(async (user: User) => {
      const attendance = await prisma.attendance.findMany({
        where: {
          userId: user.id,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          date: "asc",
        },
      });

      const presentCount = attendance.filter(
        (a: Attendance) => a.status === "PRESENT"
      ).length;
      const absentCount = attendance.filter(
        (a: Attendance) => a.status === "ABSENT"
      ).length;
      const lateCount = attendance.filter(
        (a: Attendance) => a.status === "LATE"
      ).length;
      const totalWorkHours = calculateMonthlyWorkHours(attendance);

      return {
        user: {
          id: user.id,
          name: user.name,
          department: user.department,
        },
        stats: {
          presentCount,
          absentCount,
          lateCount,
          totalWorkHours,
        },
      };
    })
  );

  return {
    data: reportData,
    total: totalTeachers,
    totalPages,
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
