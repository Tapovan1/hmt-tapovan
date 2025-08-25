// import { getUser } from "@/lib/action/getUser";
import prisma from "@/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // // Extract parameters from query string
  // const user = await getUser();
  const userId = "41";
  console.log("User ID:", userId);

  const month = searchParams.get("month");
  const year = searchParams.get("year");

  // Validate required userId parameter
  if (!userId) {
    return NextResponse.json(
      {
        error: "Missing required parameter: userId",
        message: "userId is required to fetch dashboard statistics",
      },
      { status: 400 }
    );
  }

  // Validate and parse optional month parameter
  let parsedMonth: number | undefined;
  if (month) {
    parsedMonth = Number.parseInt(month, 10);
    if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
      return NextResponse.json(
        {
          error: "Invalid month parameter",
          message: "Month must be a number between 1 and 12",
        },
        { status: 400 }
      );
    }
  }

  // Validate and parse optional year parameter
  let parsedYear: number | undefined;
  if (year) {
    parsedYear = Number.parseInt(year, 10);
    if (isNaN(parsedYear) || parsedYear < 2000 || parsedYear > 2100) {
      return NextResponse.json(
        {
          error: "Invalid year parameter",
          message: "Year must be a valid number between 2000 and 2100",
        },
        { status: 400 }
      );
    }
  }

  const currentDate = new Date();
  const selectedMonth = parsedMonth
    ? parsedMonth - 1
    : currentDate.getUTCMonth(); // Month is 0-based in Date.UTC
  const selectedYear = parsedYear || currentDate.getUTCFullYear();

  const monthStart = new Date(Date.UTC(selectedYear, selectedMonth, 1)); // Correct start of the month
  const monthEnd = new Date(
    Date.UTC(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999)
  ); // Correct end of the month

  // Today's date formatted correctly
  const indianDateString = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });

  const formattedIndianDate = new Date(indianDateString);

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

  const stats = {
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

  // Return successful response with stats
  return NextResponse.json({
    success: true,
    data: stats,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, month, year } = body;

    // Validate required userId parameter
    if (!userId) {
      return NextResponse.json(
        {
          error: "Missing required field: userId",
          message: "userId is required to fetch dashboard statistics",
        },
        { status: 400 }
      );
    }

    // Validate optional month parameter
    if (
      month !== undefined &&
      (typeof month !== "number" || month < 1 || month > 12)
    ) {
      return NextResponse.json(
        {
          error: "Invalid month field",
          message: "Month must be a number between 1 and 12",
        },
        { status: 400 }
      );
    }

    // Validate optional year parameter
    if (
      year !== undefined &&
      (typeof year !== "number" || year < 2000 || year > 2100)
    ) {
      return NextResponse.json(
        {
          error: "Invalid year field",
          message: "Year must be a number between 2000 and 2100",
        },
        { status: 400 }
      );
    }

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

    const stats = {
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

    // Return successful response with stats
    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Dashboard stats API error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: "Internal server error",
          message: error.message,
          success: false,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Unknown error occurred",
        message:
          "An unexpected error occurred while fetching dashboard statistics",
        success: false,
      },
      { status: 500 }
    );
  }
}
