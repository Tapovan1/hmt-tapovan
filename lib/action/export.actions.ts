"use server";

import { getReportData } from "./report.actions";
import * as XLSX from "xlsx";

export async function exportToExcel(params: {
  department?: string;
  start?: Date;
  end?: Date;
}) {
  const reportData = await getReportData(params);

  // Prepare data for Excel
  const excelData = reportData.map((item) => ({
    "Teacher Name": item.user.name,
    Department: item.user.department,
    "Present Days": item.stats.presentCount,
    "Absent Days": item.stats.absentCount,
    "Late Days": item.stats.lateCount,
    "Total Work Hours": item.stats.totalWorkHours,
  }));

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Report");

  // Generate Excel buffer
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  // Return the buffer
  return buffer;
}
