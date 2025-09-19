"use server";
import ExcelJS from "exceljs";
import { getMonthFromDate } from "../utils/month";
import prisma from "../prisma";

interface SalaryData {
  no: number;
  id: string;
  name: string;
  department: string;
  salary: number;
  lateTime: number;
  off: number;
  daysInMonth: number;
  absentDay: number;
  hajarDivas: number;
  sundays: number;
  paySalary01: number;
  paySalary02: number;
  proTax: number;
  penalty: number;
  penaltyReason: string;
  total: number;
}

// Helper function to count Sundays in a date range
function countSundaysInRange(startDate: Date, endDate: Date): number {
  let count = 0;
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    if (currentDate.getDay() === 0) {
      count++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return count;
}

// Optimized function with better connection management
export async function getSalaryData(params: {
  department?: string;
  start?: Date;
  end?: Date;
}) {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      return await getSalaryDataInternal(params);
    } catch (error: unknown) {
      console.error(`Attempt ${retryCount + 1} failed:`, error);

      // Check if it's a connection pool error
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "P2024" &&
        retryCount < maxRetries - 1
      ) {
        retryCount++;
        // Wait before retrying (exponential backoff)
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, retryCount) * 1000)
        );
        continue;
      }

      console.error("Error in getSalaryData:", error);
      return [];
    }
  }

  return [];
}

async function getSalaryDataInternal(params: {
  department?: string;
  start?: Date;
  end?: Date;
}) {
  const startDate = new Date(Number(params.start));
  const endDate = new Date(Number(params.end));
  startDate.setUTCHours(0, 0, 0, 0);
  endDate.setUTCHours(0, 0, 0, 0);

  const month = getMonthFromDate(startDate);
  const daysInMonth = new Date(
    startDate.getFullYear(),
    startDate.getMonth() + 1,
    0
  ).getDate();
  const totalSundays = countSundaysInRange(startDate, endDate);

  // Use a single transaction to get all data at once
  const result = await prisma.$transaction(
    async (tx) => {
      // Get users with department filter
      const users = await tx.user.findMany({
        where: {
          ...(params.department ? { department: params.department } : {}),
          NOT: [{ role: "SUPERADMIN" }],
          status: "ACTIVE",
        },
        select: {
          id: true,
          name: true,
          department: true,
          salary: true,
        },
      });

      if (!users || users.length === 0) {
        return { users: [], attendance: [], penalties: [] };
      }

      const userIds = users.map((user) => user.id);

      // Get attendance data for all users in one query
      const attendance = await tx.attendance.findMany({
        where: {
          userId: { in: userIds },
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          userId: true,
          date: true,
          status: true,
          checkIn: true,
          checkOut: true,
          late: true,
        },
        orderBy: {
          date: "asc",
        },
      });

      // Get penalties for all users in one query
      const penalties = await tx.employeePenalty.findMany({
        where: {
          userId: { in: userIds },
          month: month,
        },
        select: {
          userId: true,
          amount: true,
          reason: true,
        },
      });

      return { users, attendance, penalties };
    },
    {
      timeout: 30000, // 30 second timeout
      maxWait: 5000, // 5 second max wait
    }
  );

  // Process the data outside the transaction
  const { users, attendance, penalties } = result;

  // Create maps for efficient lookups
  const attendanceMap = new Map<
    string,
    {
      userId: string;
      date: Date;
      status: string;
      checkIn: Date | null;
      checkOut: Date | null;
      late: number | null;
    }[]
  >();
  attendance.forEach((att) => {
    if (!attendanceMap.has(att.userId)) {
      attendanceMap.set(att.userId, []);
    }
    attendanceMap.get(att.userId)!.push(att);
  });

  const penaltyMap = new Map<string, { amount: number; reason: string }>();
  penalties.forEach((penalty) => {
    penaltyMap.set(penalty.userId, {
      amount: penalty.amount,
      reason: penalty.reason || "",
    });
  });

  // Process salary data
  const salaryData: SalaryData[] = users.map((user, index) => {
    const userAttendance = attendanceMap.get(user.id) || [];

    let lateMinutes = 0;
    let absentDays = 0;
    let leaveDays = 0;
    let presentDays = 0;
    let lateDays = 0;
    let sundaysAlreadyCounted = 0;

    userAttendance.forEach((att) => {
      lateMinutes += att.late || 0;

      switch (att.status) {
        case "ABSENT":
          absentDays++;
          break;
        case "LEAVE":
          leaveDays++;
          break;
        case "PRESENT":
          presentDays++;
          break;
        case "LATE":
          lateDays++;
          break;
      }

      // Count Sundays where user was present or late
      if (
        new Date(att.date).getDay() === 0 &&
        (att.status === "PRESENT" || att.status === "LATE")
      ) {
        sundaysAlreadyCounted++;
      }
    });

    const offDays = leaveDays + absentDays;
    const additionalSundays = Math.max(0, totalSundays - sundaysAlreadyCounted);
    const hajarDivas = presentDays + lateDays + totalSundays;

    const baseSalary = user.salary || 0;
    const salaryPerDay = baseSalary / daysInMonth;
    const salaryPerHour = salaryPerDay / 8;
    const salaryPerMinute = salaryPerHour / 60;

    const lateDeduction = lateMinutes * salaryPerMinute;
    const paySalary01 = lateDeduction;
    const paySalary02 = hajarDivas * salaryPerDay - lateDeduction;
    const proTax = baseSalary >= 12500 ? 200 : 0;

    const userPenalty = penaltyMap.get(user.id) || { amount: 0, reason: "" };
    const total = paySalary02 - proTax - userPenalty.amount;

    return {
      no: index + 1,
      id: user.id,
      name: user.name,
      department: user.department,
      salary: baseSalary,
      lateTime: lateMinutes,
      off: offDays,
      daysInMonth: daysInMonth,
      absentDay: absentDays,
      hajarDivas: hajarDivas,
      sundays: additionalSundays,
      paySalary01: Number(paySalary01.toFixed(2)),
      paySalary02: Number(paySalary02.toFixed(2)),
      proTax: proTax,
      penalty: userPenalty.amount,
      penaltyReason: userPenalty.reason,
      total: Number(total.toFixed(2)),
    };
  });

  console.log("Final salary data count:", salaryData.length);
  return salaryData;
}

export async function exportSalaryToExcel(params) {
  // Fetch salary data
  const salaryData = await getSalaryData(params);

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Salary Report");

  const startDate = new Date(Number(params.start));
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const month = monthNames[startDate.getMonth()];
  const year = startDate.getFullYear();
  const departmentName = params.department || "All Departments";

  const title = `${departmentName} - Salary Report for ${month} ${year}`;

  // 🧾 Headers
  const headers = [
    "NO",
    "NAME",
    "DEPARTMENT",
    "SALARY",
    "MONTH DAYS",
    "HAJAR DIVAS",
    "OFF DAYS",
    "LATE MINUTES",
    "LATE MINUTES CHAR.",
    "SALARY",
    "PRO TAX",
    "PENALTY",
    "TOTAL",
  ];

  // 📌 Add title row
  worksheet.mergeCells(1, 1, 1, headers.length);
  const titleCell = worksheet.getCell("A1");
  titleCell.value = title;
  titleCell.font = { bold: true, size: 14 };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };

  // 🧾 Add headers
  const headerRow = worksheet.addRow(headers);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE6E6E6" },
    };
    cell.alignment = { horizontal: "center" };
    cell.border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // 🧾 Add data rows
  salaryData.forEach((item) => {
    const row = worksheet.addRow([
      item.no,
      item.name,
      item.department,
      item.salary,
      item.daysInMonth,
      item.hajarDivas,
      item.off,
      item.lateTime,
      item.paySalary01,
      item.paySalary02,
      item.proTax,
      item.penalty,
      item.total,
    ]);

    row.getCell(1).alignment = { horizontal: "center" }; // NO
    row.getCell(2).font = { bold: true }; // NAME
    row.getCell(2).alignment = { horizontal: "center" }; // NAME

    row.getCell(3).alignment = { horizontal: "center" }; // DEPARTMENT
    row.getCell(4).alignment = { horizontal: "center" }; // SALARY
    row.getCell(5).alignment = { horizontal: "center" }; // MONTH DAYS
    row.getCell(6).alignment = { horizontal: "center" }; // HAJAR DIVAS
    row.getCell(7).alignment = { horizontal: "center" }; // OFF DAYS
    row.getCell(8).alignment = { horizontal: "center" }; // LATE MINUTES
    row.getCell(9).alignment = { horizontal: "center" }; // LATE
    row.getCell(10).alignment = { horizontal: "center" }; // SALARY
    row.getCell(11).alignment = { horizontal: "center" }; // PRO TAX
    row.getCell(12).alignment = { horizontal: "center" }; // PENALTY
    row.getCell(13).alignment = { horizontal: "center" }; // TOTAL

    // Right-align number columns
    for (let c = 4; c <= headers.length; c++) {
      row.getCell(c).alignment = { horizontal: "center" };
      // SALARY = int, rest = float
    }
  });

  //for coumn name PENALTY need bg like red all dara in coulmn also

  const penaltyColumn = worksheet.getColumn("L");
  penaltyColumn.eachCell((cell) => {
    if (cell.value && typeof cell.value === "number" && cell.value > 0) {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFF0000" }, // Red background for penalty
      };
      cell.font = { color: { argb: "FFFFFFFF" } }; // White text for contrast
    }
  });

  // 📏 Column widths
  const colWidths = [5, 25, 15, 10, 15, 15, 15, 20, 20, 20, 10, 12, 20];
  worksheet.columns.forEach((col, idx) => {
    col.width = colWidths[idx] || 12;
  });

  // ⬇ Return file buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}
