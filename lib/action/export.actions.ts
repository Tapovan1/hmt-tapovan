"use server";

import { Status } from "@prisma/client";
import { getReportDataWithoutPagination } from "./report.actions";
import ExcelJS from "exceljs";

export async function exportToExcel(params: {
  department?: string;
  start?: Date;
  end?: Date;
}) {
  const reportData = await getReportDataWithoutPagination(params);

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Attendance Report");

  const startDate = params.start || new Date();
  const daysInMonth = new Date(
    startDate.getFullYear(),
    startDate.getMonth() + 1,
    0
  ).getDate();

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

  const title = `${departmentName} - Attendance Report for ${month} ${year}`;

  // 📌 Build Headers
  const headers = ["NAME"];
  for (let i = 1; i <= daysInMonth; i++) headers.push(i.toString());
  headers.push("TOTAL LATE", "TOTAL EARLY", "L", "DAY");

  // 🧾 Title Row
  worksheet.mergeCells(1, 1, 1, headers.length);
  const titleCell = worksheet.getCell("A1");
  titleCell.value = title;
  titleCell.font = { bold: true, size: 14 };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };

  // 🧾 Header Row
  const headerRow = worksheet.addRow(headers);
  headerRow.eachCell((cell, colNumber) => {
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

    // Mark Sundays in red header
    if (colNumber > 1 && colNumber <= daysInMonth + 1) {
      const currentDate = new Date(startDate);
      currentDate.setDate(colNumber - 1);
      if (currentDate.getDay() === 0) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFF0000" },
        };
        cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
      }
    }
  });

  // 📌 Data Rows
  reportData.data.forEach((item) => {
    const row: (string | number)[] = [item.user.name];
    let totalMinutesLate = 0;
    let totalEarlyExit = 0;
    let leaveCount = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const attendance = item.dailyAttendance?.find(
        (a) => new Date(a.date).getDate() === day
      );

      const currentDate = new Date(startDate);
      currentDate.setDate(day);
      const isSunday = currentDate.getDay() === 0;

      let cellValue: string | number = "-";

      if (attendance) {
        if (attendance.status) {
          cellValue = attendance.minutesLate > 0 ? attendance.minutesLate : "P";
          totalMinutesLate += attendance.minutesLate || 0;
        } else if (attendance.status === Status.ON_LEAVE) {
          cellValue = "L";
          leaveCount++;
        } else if (attendance.status === Status.ABSENT) {
          cellValue = "A";
        } else {
          const minutesLate = Math.round(attendance.minutesLate || 0);
          cellValue = minutesLate > 0 ? minutesLate : "-";
          totalMinutesLate += minutesLate;
        }
      } else if (isSunday) {
        cellValue = "H";
      }
      const totalEarlyExitValue = Math.round(attendance?.early || 0);
      totalEarlyExit += totalEarlyExitValue;
      // cellValue = totalEarlyExitValue > 0 ? totalEarlyExitValue : "-";
      // totalEarlyExit += totalEarlyExitValue;

      row.push(cellValue);
    }

    row.push(totalMinutesLate);
    row.push(totalEarlyExit);
    row.push(leaveCount);
    row.push(daysInMonth);
    const dataRow = worksheet.addRow(row);

    dataRow.getCell(1).font = { bold: true };
    dataRow.getCell(1).alignment = { horizontal: "center" };

    for (let c = 2; c <= daysInMonth + 3; c++) {
      const cell = dataRow.getCell(c);
      const value = cell.value;

      if (value === "H" || value === "A") {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFF0000" },
        };
        cell.font = { color: { argb: "FFFFFFFF" } };
      }

      cell.alignment = { horizontal: "center" };
    }
  });

  // 📏 Set column widths
  const colWidths = [25];
  for (let i = 1; i <= daysInMonth; i++) colWidths.push(5);
  colWidths.push(12, 5, 5); // Summary columns

  worksheet.columns.forEach((col, idx) => {
    col.width = colWidths[idx] || 10;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}
