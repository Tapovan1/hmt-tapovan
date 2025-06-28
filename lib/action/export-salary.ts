"use server";

import { getReportData, SgetEmployees } from "./report.actions";
import { getPenaltiesForUsers } from "./penalty.action";
import * as XLSX from "xlsx";
import { getMonthFromDate } from "../utils/month";

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
  const start = new Date(startDate);
  const end = new Date(endDate);

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const currentDate = new Date(start);
  while (currentDate <= end) {
    if (currentDate.getDay() === 0) {
      count++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return count;
}

export async function getSalaryData(params: {
  department?: string;
  start?: Date;
  end?: Date;
}) {
  try {
    console.log("Getting salary data with params:", params);

    // Get report data for attendance
    const reportData = await getReportData({
      department: params.department,
      start: params.start,
      end: params.end,
    });

    const startDate = new Date(Number(params.start));
    const endDate = new Date(Number(params.end));

    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(0, 0, 0, 0);

    // Get month from start date for penalty lookup
    const month = getMonthFromDate(startDate);
    console.log("Looking for penalties in month:", month);

    const daysInMonth = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      0
    ).getDate();
    const totalSundays = countSundaysInRange(startDate, endDate);

    // Get all users first
    const users = await SgetEmployees();
    const filteredUsers = params.department
      ? users?.filter((user) => user.department === params.department)
      : users;

    console.log("Filtered users count:", filteredUsers?.length);

    if (!filteredUsers || filteredUsers.length === 0) {
      return [];
    }

    // Get user IDs for penalty lookup
    const userIds = filteredUsers.map((user) => user.id);
    console.log("User IDs for penalty lookup:", userIds.length);

    // Get penalties for these specific users in the month
    const penalties = await getPenaltiesForUsers(userIds, month);
    console.log("Fetched penalties:", penalties.length);

    // Create a map for quick penalty lookup by userId
    const penaltyMap = new Map();
    penalties.forEach((penalty) => {
      console.log(
        `Mapping penalty for user ${penalty.userId}: ${penalty.amount}`
      );
      penaltyMap.set(penalty.userId, {
        amount: penalty.amount,
        reason: penalty.reason || "",
      });
    });

    console.log("Penalty map size:", penaltyMap.size);

    const salaryData: SalaryData[] = await Promise.all(
      filteredUsers.map(async (user, index) => {
        const userReport = reportData.data.find(
          (item) => item.user.id === user.id
        );

        let lateMinutes = 0;
        let absentDays = 0;
        let leaveDays = 0;
        let presentDays = 0;
        let lateDays = 0;
        let sundaysAlreadyCounted = 0;

        if (userReport) {
          lateMinutes = userReport.dailyAttendance.reduce(
            (total, att) => total + (att.minutesLate || 0),
            0
          );
          absentDays = userReport.stats.absentCount;
          leaveDays = userReport.stats.leaveCount;
          presentDays = userReport.stats.presentCount;
          lateDays = userReport.stats.lateCount;

          sundaysAlreadyCounted = userReport.dailyAttendance.filter(
            (att) =>
              new Date(att.date).getDay() === 0 &&
              (att.status === "PRESENT" || att.status === "LATE")
          ).length;
        }

        const offDays = leaveDays + absentDays;
        const additionalSundays = Math.max(
          0,
          totalSundays - sundaysAlreadyCounted
        );
        const hajarDivas = presentDays + lateDays + additionalSundays;

        const baseSalary = user.salary || 0;
        const salaryPerDay = baseSalary / daysInMonth;
        const salaryPerHour = salaryPerDay / 8;
        const salaryPerMinute = salaryPerHour / 60;

        const lateDeduction = lateMinutes * salaryPerMinute;
        const paySalary01 = lateDeduction;
        const paySalary02 = hajarDivas * salaryPerDay - lateDeduction;

        const proTax = baseSalary >= 12500 ? 200 : 0;

        // Get penalty for this user
        const userPenalty = penaltyMap.get(user.id) || {
          amount: 0,
          reason: "",
        };

        // Calculate final total including penalty
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
      })
    );

    console.log("Final salary data count:", salaryData.length);
    return salaryData;
  } catch (error) {
    console.error("Error in getSalaryData:", error);
    return [];
  }
}

export async function exportSalaryToExcel(params: {
  department?: string;
  start?: Date;
  end?: Date;
}) {
  const startDate = new Date(Number(params.start));
  const endDate = new Date(Number(params.end));

  startDate.setUTCHours(0, 0, 0, 0);
  endDate.setUTCHours(0, 0, 0, 0);

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
  const titleRow = [`${departmentName} - Salary Report for ${month} ${year}`];

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
    "PENALTY REASON",
    "TOTAL",
  ];

  // Get salary data with penalties
  const salaryData = await getSalaryData(params);

  const excelData = [];
  excelData.push(titleRow);
  excelData.push(headers);

  salaryData.forEach((item) => {
    excelData.push([
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
      item.penaltyReason,
      item.total,
    ]);
  });

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(excelData);

  worksheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
  ];

  const titleCell = XLSX.utils.encode_cell({ r: 0, c: 0 });
  if (!worksheet[titleCell]) worksheet[titleCell] = {};
  worksheet[titleCell].s = {
    font: { bold: true, sz: 14 },
    alignment: { horizontal: "center" },
  };

  for (let c = 0; c < headers.length; c++) {
    const cellAddress = XLSX.utils.encode_cell({ c, r: 1 });
    if (!worksheet[cellAddress]) worksheet[cellAddress] = {};
    worksheet[cellAddress].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: "FFE6E6E6" } },
      alignment: { horizontal: "center" },
    };
  }

  for (let r = 2; r < excelData.length; r++) {
    const noCell = XLSX.utils.encode_cell({ c: 0, r });
    if (!worksheet[noCell]) worksheet[noCell] = {};
    worksheet[noCell].s = { alignment: { horizontal: "center" } };

    const nameCell = XLSX.utils.encode_cell({ c: 1, r });
    if (!worksheet[nameCell]) worksheet[nameCell] = {};
    worksheet[nameCell].s = { font: { bold: true } };

    for (let c = 3; c < headers.length - 1; c++) {
      const cellAddress = XLSX.utils.encode_cell({ c, r });
      if (!worksheet[cellAddress]) worksheet[cellAddress] = {};
      worksheet[cellAddress].s = {
        alignment: { horizontal: "right" },
        numFmt: c === 3 ? "0" : "0.00",
      };
    }
  }

  const colWidths = [5, 25, 15, 10, 10, 10, 12, 10, 15, 15, 10, 12, 20, 12];
  worksheet["!cols"] = colWidths.map((width) => ({ width }));

  XLSX.utils.book_append_sheet(workbook, worksheet, "Salary Report");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  return buffer;
}

// Export the penalty actions for use in the frontend
