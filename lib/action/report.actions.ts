"use server";
import prisma from "@/lib/prisma";

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
    leaveCount: number;
    totalMinuteLate: string;
    totalEarlyExit: string;
  };
  dailyAttendance: {
    date: Date;
    status: Status;
    minutesLate: number;
    checkIn: Date | null;
    checkOut: Date | null;
    early: number | null;
  }[];
}

//i need same logic getreportdata but withut pagination
export async function getReportDataWithoutPagination(params: {
  department?: string;
  start?: Date;
  end?: Date;
}) {
  const { department, start, end } = params;

  if (!start || !end) {
    throw new Error("Start and end dates are required");
  }

  const startDate = new Date(start);
  const endDate = new Date(end);

  // Set time to midnight (00:00:00)
  startDate.setUTCHours(0, 0, 0, 0);
  endDate.setUTCHours(0, 0, 0, 0);

  const usersQuery = {
    where: {
      ...(department ? { department } : {}),
      NOT: [{ role: "SUPERADMIN" }],
    },
  };

  const users = await prisma.user.findMany({
    ...usersQuery,
    orderBy: { name: "asc" },
  });
 //checkif givern date rangee holiday exists in holiday table
 const holidays = await prisma.holiday.findMany({
   where : {
     date:{
       gte:startDate,
       lte:endDate
     },

   }
 })
  // Process users in smaller batches to avoid connection pool exhaustion
  const batchSize = 10;
  const reportData: ReportData[] = [];

  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map(async (user) => {
        try {
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

          const transformedAttendance = attendance.map((att) => ({
            date: att.date,
            status: att.status,
            minutesLate: att.late ?? 0,
            checkIn: att.checkIn,
            checkOut: att.checkOut,
            late: att.late,
            early: att.early,
          }));

          const stats = transformedAttendance.reduce(
            (acc, curr) => {
              if (curr.status === Status.PRESENT) {
                acc.presentCount++;
              } else if (curr.status === Status.ABSENT) {
                acc.absentCount++;
              } else if (curr.status === Status.LATE) {
                acc.lateCount++;
              } else if (curr.status === Status.ON_LEAVE) {
                acc.leaveCount++;
              }
              return acc;
            },
            { presentCount: 0, absentCount: 0, lateCount: 0, leaveCount: 0 }
          );

          const totalMinuteLate = transformedAttendance.reduce(
            (acc, curr) => acc + (curr.late ?? 0),
            0
          );

          const totalEarlyExit = transformedAttendance.reduce(
            (acc, curr) => acc + (curr.early ?? 0),
            0
          );

          return {
            user: {
              id: user.id,
              name: user.name,
              department: user.department,
            },
            stats: {
              ...stats,
              totalMinuteLate,
              totalEarlyExit,
            },
            dailyAttendance: transformedAttendance,
            holidays
          };
        } catch (error) {
          console.error(`Error processing user ${user.id}:`, error);
          return {
            user: {
              id: user.id,
              name: user.name,
              department: user.department,
            },
            stats: {
              presentCount: 0,
              absentCount: 0,
              lateCount: 0,
              leaveCount: 0,
              totalMinuteLate: 0,
            },
            dailyAttendance: [],
          };
        }
      })
    );

    reportData.push(...batchResults);
  }

  return {
    data: reportData,
  };
}

export async function getReportData(params: {
  department?: string;
  start?: Date;
  end?: Date;
  page?: number;
}) {
  const { department, start, end, page = 1 } = params;
  console.log("getReportData called with params:", {
    department,
    start,
    end,
    page,
  });

  const itemsPerPage = 10;

  const startDate = new Date(Number(start));
  const endDate = new Date(Number(end));

  // Set time to midnight (00:00:00)
  startDate.setUTCHours(0, 0, 0, 0);
  endDate.setUTCHours(0, 0, 0, 0);

  // Add one day to both dates

  // Add one day to both dates

  const usersQuery = {
    where: {
      ...(department ? { department } : {}),
      NOT: [{ role: "SUPERADMIN" }],
    },
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

      const attendanceQuery = {
        where: {
          userId: user.id,
          //exclude SUPERADMIN role

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

        return {
          date: att.date,
          status: att.status,
          minutesLate: att.late ?? 0,
          checkIn: att.checkIn,
          checkOut: att.checkOut,
          late: att.late,
          early: att.early,
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
          } else if (curr.status === Status.ON_LEAVE) {
            acc.leaveCount++;
          }
          return acc;
        },
        { presentCount: 0, absentCount: 0, lateCount: 0, leaveCount: 0 }
      );

      // Calculate total work hours
      // const totalWorkHours = calculateMonthlyWorkHours(attendance);

      const totalMinuteLate = transformedAttendance.reduce(
        (acc, curr) => acc + (curr.late ?? 0),
        0
      );

      const totalEarlyExit = transformedAttendance.reduce(
        (acc, curr) => acc + (curr.early ?? 0),
        0
      );

      return {
        user: {
          id: user.id,
          name: user.name,
          department: user.department,
        },
        stats: {
          ...stats,
          totalMinuteLate,
          totalEarlyExit,
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
export const SgetEmployees = async () => {
  try {
    const getEmployeeData = await prisma?.user.findMany({
      where: {
        NOT: [{ role: "SUPERADMIN" }],
      },
    });
    if (!getEmployeeData) {
      return [];
    }

    return getEmployeeData;
  } catch (error) {
    console.log(error);
  }
};

export async function getDepartments() {
  // Get unique departments from users who are teachers
  const departments = await prisma.user.findMany({
    where: {
      NOT: {
        role: {
          in: ["SUPERADMIN"],
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
