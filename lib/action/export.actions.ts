"use server";

import { getReportData } from "./report.actions";
import * as XLSX from "xlsx";
import { Status } from "@prisma/client";

export async function exportToExcel(params: {
  department?: string;
  start?: Date;
  end?: Date;
}) {
  const reportData = await getReportData(params);

  // Get the month and year from start date
  const startDate = params.start || new Date();
  const daysInMonth = new Date(
    startDate.getFullYear(),
    startDate.getMonth() + 1,
    0
  ).getDate();

  // Create headers for all days in month
  const headers = ["NAME"];
  for (let i = 1; i <= daysInMonth; i++) {
    headers.push(i.toString());
  }
  headers.push("TOTAL MINIT LATE", "CL", "DAY");

  // Prepare data for Excel with the new format
  const excelData = [];

  // Add headers
  excelData.push(headers);

  // Process each user's data
  reportData.data.forEach((item) => {
    const row: (string | number)[] = [item.user.name];

    // Initialize counters
    let totalMinutesLate = 0;
    let clCount = 0;

    // Fill data for each day
    for (let day = 1; day <= daysInMonth; day++) {
      const attendance = item.dailyAttendance?.find(
        (a) => new Date(a.date).getDate() === day
      );

      const currentDate = new Date(startDate);
      currentDate.setDate(day);
      const isSunday = currentDate.getDay() === 0;

      let cellValue = "-"; // Default value

      if (attendance) {
        if (attendance.status === Status.ON_LEAVE) {
          cellValue = "CL";
          clCount++;
        } else if (attendance.status === Status.ABSENT) {
          cellValue = "A";
        } else {
          const minutesLate = Math.round(attendance.minutesLate || 0);
          cellValue = minutesLate > 0 ? minutesLate.toString() : "-";
          totalMinutesLate += minutesLate;
        }
      } else if (isSunday) {
        cellValue = "H";
      }

      row.push(cellValue);
    }

    // Add summary columns
    row.push(totalMinutesLate);
    row.push(clCount);
    row.push(daysInMonth); // Total days in month

    excelData.push(row);
  });

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(excelData);

  // Apply styles to cells
  for (let r = 1; r < excelData.length; r++) {
    const row = excelData[r];

    // Apply styles for each day cell (columns 1 to daysInMonth)
    for (let c = 1; c <= daysInMonth; c++) {
      const cellValue = row[c];
      const cellAddress = XLSX.utils.encode_cell({ c, r });

      // Initialize cell if it doesn't exist
      if (!worksheet[cellAddress]) worksheet[cellAddress] = { v: cellValue };

      // Apply styles based on cell value
      if (cellValue === "H" || cellValue === "A") {
        worksheet[cellAddress].s = {
          fill: { fgColor: { rgb: "FFFF0000" } }, // Red background
          font: { color: { rgb: "FFFFFFFF" } }, // White text
        };
      }
    }
  }

  // Highlight Sundays in red in the header row
  for (let i = 1; i <= daysInMonth; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(i);
    if (currentDate.getDay() === 0) {
      // Sunday
      const cellAddress = XLSX.utils.encode_cell({ c: i, r: 0 });
      if (!worksheet[cellAddress]) worksheet[cellAddress] = {};
      worksheet[cellAddress].s = {
        fill: { fgColor: { rgb: "FFFF0000" } }, // Red background
        font: { color: { rgb: "FFFFFFFF" } }, // White text
      };
    }
  }

  // Set column widths
  const colWidths = [20]; // Name column
  for (let i = 1; i <= daysInMonth; i++) {
    colWidths.push(5); // Day columns
  }
  colWidths.push(10, 5, 5); // Total minutes, CL, Days columns

  worksheet["!cols"] = colWidths.map((width) => ({ width }));

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Report");

  // Generate Excel buffer
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return buffer;
}
