"use server";

import { getReportData, SgetEmployees } from "./report.actions";
import * as XLSX from "xlsx";
import { getEmployees } from "@/lib/action/user.action";

interface SalaryData {
  no: number;
  name: string;
  department: string;
  salary: number;
  lateTime: number;
  off: number;
  hajarDivas: number;
  paySalary01: number;
  paySalary02: number;
  proTax: number;
  total: number;
}

// Add a new function to get the salary data without creating an Excel file
export async function getSalaryData(params: {
  department?: string;
  start?: Date;
  end?: Date;
}) {
  // Get report data for attendance
  const reportData = await getReportData({
    department: params.department,
    start: params.start,
    end: params.end,
    // We'll fetch all data for salary report
  });

  // Get the month and year from start date
  const startDate = params.start || new Date();
  const daysInMonth = new Date(
    startDate.getFullYear(),
    startDate.getMonth() + 1,
    0
  ).getDate();

  // Fetch all employees using your existing server action
  const users = await SgetEmployees();

  // Filter by department if specified
  const filteredUsers = params.department
    ? users?.filter((user) => user.department === params.department)
    : users;

  // Process each user's data and calculate salary
  const salaryData: SalaryData[] = await Promise.all(
    (filteredUsers || []).map(async (user, index) => {
      // Find user in report data
      const userReport = reportData.data.find(
        (item) => item.user.id === user.id
      );

      // Default values if user not found in report
      let lateMinutes = 0;
      let absentDays = 0;
      let leaveDays = 0;
      let presentDays = 0;

      if (userReport) {
        // Get attendance stats
        lateMinutes = userReport.dailyAttendance.reduce(
          (total, att) => total + (att.minutesLate || 0),
          0
        );
        absentDays = userReport.stats.absentCount;
        leaveDays = userReport.stats.leaveCount;
        presentDays = userReport.stats.presentCount;
      }

      // Calculate total off days (absent + leave)
      const offDays = absentDays + leaveDays;

      // Calculate working days (hajar divas)
      const hajarDivas = daysInMonth - offDays;

      // Get base salary (default to 0 if not set)
      const baseSalary = user.salary || 0;

      // Calculate salary per day
      const salaryPerDay = baseSalary / daysInMonth;

      // Calculate salary per hour (assuming 8-hour workday)
      const salaryPerHour = salaryPerDay / 8;

      // Calculate salary per minute
      const salaryPerMinute = salaryPerHour / 60;

      // Calculate deduction for late minutes
      const lateDeduction = lateMinutes * salaryPerMinute;

      // Calculate deduction for absent days
      const absentDeduction = offDays * salaryPerDay;

      // Calculate pay salary values
      const paySalary01 = lateDeduction; // PAY SALARY 01 is the late minute penalty for hajardivas

      const paySalary02 = hajarDivas * salaryPerDay - lateDeduction;

      // Apply professional tax if salary is 10000 or above
      const proTax = baseSalary >= 10000 ? 200 : 0;

      // Calculate final total
      const total = paySalary02 - proTax - paySalary01;

      return {
        no: index + 1,
        name: user.name,
        department: user.department,
        salary: baseSalary,
        lateTime: lateMinutes,
        off: offDays,
        hajarDivas: hajarDivas,
        paySalary01: Number(paySalary01.toFixed(2)),
        paySalary02: Number(paySalary02.toFixed(2)),
        proTax: proTax,
        total: Number(total.toFixed(2)),
      };
    })
  );

  return salaryData;
}

export async function exportSalaryToExcel(params: {
  department?: string;
  start?: Date;
  end?: Date;
}) {
  // Get report data for attendance
  const reportData = await getReportData({
    department: params.department,
    start: params.start,
    end: params.end,
    page: 1, // We'll fetch all data for salary report
  });

  // Get the month and year from start date
  const startDate = params.start || new Date();
  const daysInMonth = new Date(
    startDate.getFullYear(),
    startDate.getMonth() + 1,
    0
  ).getDate();

  // Format month and year for header
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

  // Create title row with department and date information
  const departmentName = params.department || "All Departments";
  const titleRow = [`${departmentName} - Salary Report for ${month} ${year}`];

  // Create headers
  const headers = [
    "NO",
    "NAME",
    "DIPART",
    "SALARY",
    "LATE TIME",
    "OFF",
    "HAJAR DIVAS",
    "PAY SALARY 01",
    "PAY SALARY 02",
    "PRO TAX",
    "TOTAL",
  ];

  // Fetch all employees using your existing server action
  const users = await getEmployees();

  // Filter by department if specified
  const filteredUsers = params.department
    ? users?.filter((user) => user.department === params.department)
    : users;

  // Process each user's data and calculate salary
  const salaryData: SalaryData[] = await Promise.all(
    (filteredUsers || []).map(async (user, index) => {
      // Find user in report data
      const userReport = reportData.data.find(
        (item) => item.user.id === user.id
      );

      // Default values if user not found in report
      let lateMinutes = 0;
      let absentDays = 0;
      let leaveDays = 0;
      let presentDays = 0;

      if (userReport) {
        // Get attendance stats
        lateMinutes = userReport.dailyAttendance.reduce(
          (total, att) => total + (att.minutesLate || 0),
          0
        );
        absentDays = userReport.stats.absentCount;
        leaveDays = userReport.stats.leaveCount;
        presentDays = userReport.stats.presentCount;
      }

      // Calculate total off days (absent + leave)
      const offDays = absentDays + leaveDays;

      // Calculate working days (hajar divas)
      const hajarDivas = daysInMonth - offDays;

      // Get base salary (default to 0 if not set)
      const baseSalary = user.salary || 0;

      // Calculate salary per day
      const salaryPerDay = baseSalary / daysInMonth;

      // Calculate salary per hour (assuming 8-hour workday)
      const salaryPerHour = salaryPerDay / 8;

      // Calculate salary per minute
      const salaryPerMinute = salaryPerHour / 60;

      // Calculate deduction for late minutes
      const lateDeduction = lateMinutes * salaryPerMinute;

      // Calculate deduction for absent days

      // Calculate pay salary values
      const paySalary01 = lateDeduction; // PAY SALARY 01 is the late minute penalty for hajardivas

      const paySalary02 = hajarDivas * salaryPerDay - lateDeduction;

      // Apply professional tax if salary is 10000 or above
      const proTax = baseSalary >= 10000 ? 200 : 0;

      // Calculate final total
      const total = paySalary02 - proTax - paySalary01;

      return {
        no: index + 1,
        name: user.name,
        department: user.department,
        salary: baseSalary,
        lateTime: lateMinutes,
        off: offDays,
        hajarDivas: hajarDivas,
        paySalary01: paySalary01,
        paySalary02: Number(paySalary02.toFixed(2)),
        proTax: proTax,
        total: Number(total.toFixed(2)),
      };
    })
  );

  // Prepare data for Excel
  const excelData = [];

  // Add title row and headers
  excelData.push(titleRow);
  excelData.push(headers);

  // Add salary data rows
  salaryData.forEach((item) => {
    excelData.push([
      item.no,
      item.name,
      item.department,
      item.salary,
      item.lateTime,
      item.off,
      item.hajarDivas,
      item.paySalary01,
      item.paySalary02,
      item.proTax,
      item.total,
    ]);
  });

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(excelData);

  // Merge cells for the title row
  worksheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
  ];

  // Style the title row
  const titleCell = XLSX.utils.encode_cell({ r: 0, c: 0 });
  if (!worksheet[titleCell]) worksheet[titleCell] = {};
  worksheet[titleCell].s = {
    font: { bold: true, sz: 14 },
    alignment: { horizontal: "center" },
  };

  // Style the header row
  for (let c = 0; c < headers.length; c++) {
    const cellAddress = XLSX.utils.encode_cell({ c, r: 1 });
    if (!worksheet[cellAddress]) worksheet[cellAddress] = {};
    worksheet[cellAddress].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: "FFE6E6E6" } }, // Light gray background
      alignment: { horizontal: "center" },
    };
  }

  // Style data cells
  for (let r = 2; r < excelData.length; r++) {
    // Style number column
    const noCell = XLSX.utils.encode_cell({ c: 0, r });
    if (!worksheet[noCell]) worksheet[noCell] = {};
    worksheet[noCell].s = {
      alignment: { horizontal: "center" },
    };

    // Style name column
    const nameCell = XLSX.utils.encode_cell({ c: 1, r });
    if (!worksheet[nameCell]) worksheet[nameCell] = {};
    worksheet[nameCell].s = {
      font: { bold: true },
    };

    // Style numeric columns (right-aligned)
    for (let c = 3; c < headers.length; c++) {
      const cellAddress = XLSX.utils.encode_cell({ c, r });
      if (!worksheet[cellAddress]) worksheet[cellAddress] = {};
      worksheet[cellAddress].s = {
        alignment: { horizontal: "right" },
        numFmt: c === 3 ? "0" : "0.00", // Format as currency with 2 decimal places
      };
    }
  }

  // Set column widths
  const colWidths = [5, 25, 15, 10, 10, 10, 12, 15, 15, 10, 12]; // Adjust as needed
  worksheet["!cols"] = colWidths.map((width) => ({ width }));

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Salary Report");

  // Generate Excel buffer
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return buffer;
}
