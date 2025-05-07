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
  const titleRow = [
    `${departmentName} - Attendance Report for ${month} ${year}`,
  ];

  // Create headers for all days in month
  const headers = ["NAME"];
  for (let i = 1; i <= daysInMonth; i++) {
    headers.push(i.toString());
  }
  headers.push("TOTAL MINIT LATE", "L", "DAY");

  // Prepare data for Excel with the new format
  const excelData = [];

  // Add title row and headers
  excelData.push(titleRow);
  excelData.push(headers);

  // Process each user's data
  reportData.data.forEach((item) => {
    const row: (string | number)[] = [item.user.name];

    // Initialize counters
    let totalMinutesLate = 0;
    let leaveCount = 0;

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
          cellValue = "L";
          leaveCount++;
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
    row.push(leaveCount);
    row.push(daysInMonth); // Total days in month

    excelData.push(row);
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

  // Apply styles to cells (offset by 1 due to title row)
  for (let r = 2; r < excelData.length; r++) {
    const row = excelData[r];

    // Center the name column (first column)
    const nameCell = XLSX.utils.encode_cell({ c: 0, r });
    if (!worksheet[nameCell]) worksheet[nameCell] = { v: row[0] };
    worksheet[nameCell].s = {
      alignment: { horizontal: "center" },
      font: { bold: true }, // Make names bold for better readability
    };

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
          alignment: { horizontal: "center" }, // Center the text
        };
      } else {
        // Center all other day cells
        worksheet[cellAddress].s = {
          alignment: { horizontal: "center" },
        };
      }
    }

    // Center the summary columns
    for (let c = daysInMonth + 1; c < headers.length; c++) {
      const cellAddress = XLSX.utils.encode_cell({ c, r });
      if (!worksheet[cellAddress]) worksheet[cellAddress] = { v: row[c - 1] };
      worksheet[cellAddress].s = {
        alignment: { horizontal: "center" },
      };
    }
  }

  // Highlight Sundays in red in the header row (offset by 1 due to title row)
  for (let i = 1; i <= daysInMonth; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(i);
    if (currentDate.getDay() === 0) {
      // Sunday
      const cellAddress = XLSX.utils.encode_cell({ c: i, r: 1 });
      if (!worksheet[cellAddress]) worksheet[cellAddress] = {};
      worksheet[cellAddress].s = {
        fill: { fgColor: { rgb: "FFFF0000" } }, // Red background
        font: { color: { rgb: "FFFFFFFF" } }, // White text
      };
    }
  }

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

  // Set column widths
  const colWidths = [20]; // Name column
  for (let i = 1; i <= daysInMonth; i++) {
    colWidths.push(5); // Day columns
  }
  colWidths.push(10, 5, 5); // Total minutes, L, Days columns

  worksheet["!cols"] = colWidths.map((width) => ({ width }));

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Report");

  // Generate Excel buffer
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return buffer;
}
