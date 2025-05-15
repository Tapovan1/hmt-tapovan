"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getReportData, type ReportData } from "@/lib/action/report.actions";
import { useState } from "react";
import { DatePicker } from "@/components/date-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  Download,
  FileText,
  CalendarRange,
  Building2,
} from "lucide-react";
import { exportToExcel } from "@/lib/action/export.actions";
import { Pagination } from "@/components/pagination";
import { Card, CardContent } from "@/components/ui/card";

const DEPARTMENTS = [
  { id: "Admin", name: "Admin" },
  { id: "Computer Operator", name: "Computer Operator" },
  { id: "Clerk", name: "Clerk" },
  { id: "Primary", name: "Primary" },
  { id: "SSC", name: "SSC" },
  { id: "HSC", name: "HSC" },
  { id: "Foundation", name: "Foundation" },
  { id: "HSC (Ahmd)", name: "HSC (Ahmd)" },
  { id: "GCI", name: "GCI" },
  { id: "Peon", name: "Peon" },
  { id: "Security", name: "Security" },
  { id: "Guest", name: "Guest" },
  { id: "Accountant", name: "Accountant" },
];

export default function ReportPage() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const handleFetchData = async (page = 1) => {
    if (!startDate || !endDate) {
      return;
    }
    const adjustedStartDate = new Date(startDate);
    const adjustedEndDate = new Date(endDate);

    adjustedStartDate.setDate(adjustedStartDate.getDate() + 1);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);

    adjustedStartDate.setHours(0, 0, 0, 0);
    adjustedEndDate.setHours(0, 0, 0, 0);

    setLoading(true);
    try {
      const { data, totalPages } = await getReportData({
        department: selectedDepartment,
        start: adjustedStartDate,
        end: adjustedEndDate,
        page,
      });
      setReportData(data);
      setTotalPages(totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching report data:", error);
      alert("Failed to fetch report data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!startDate || !endDate) {
      return;
    }
    const adjustedStartDate = new Date(startDate);
    const adjustedEndDate = new Date(endDate);

    adjustedStartDate.setDate(adjustedStartDate.getDate() + 1);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);

    adjustedStartDate.setHours(0, 0, 0, 0);
    adjustedEndDate.setHours(0, 0, 0, 0);
    setExporting(true);
    try {
      const buffer = await exportToExcel({
        department: selectedDepartment,
        start: adjustedStartDate,
        end: adjustedEndDate,
      });

      // Create blob and download
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendance-report-${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Failed to export data. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const handlePageChange = (page: number) => {
    handleFetchData(page);
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-[#e6eef8] p-3 rounded-full">
          <FileText className="h-6 w-6 text-[#4285f4]" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Attendance Report
        </h1>
      </div>

      <Card className="mb-2 border-gray-100 shadow-sm">
        <CardContent className="flex justify-center p-1  w-full">
          <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-[#4285f4]" />
                Department
              </label>
              <Select
                value={selectedDepartment}
                onValueChange={setSelectedDepartment}
              >
                <SelectTrigger className="h-10 border-gray-200 focus:ring-[#4285f4] focus:border-[#4285f4]">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <CalendarRange className="h-4 w-4 text-[#4285f4]" />
                Start Date
              </label>
              <DatePicker
                date={startDate}
                setDate={setStartDate}
                placeholder="Select start date"
                className="h-10 border-gray-200 focus:ring-[#4285f4] focus:border-[#4285f4]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <CalendarRange className="h-4 w-4 text-[#4285f4]" />
                End Date
              </label>
              <DatePicker
                date={endDate}
                setDate={setEndDate}
                placeholder="Select end date"
                className="h-10 border-gray-200 focus:ring-[#4285f4] focus:border-[#4285f4]"
              />
            </div>

            <div className="flex items-end md:col-span-1 lg:col-span-2">
              <Button
                onClick={() => handleFetchData(1)}
                disabled={loading || !startDate || !endDate}
                className="h-10 w-full md:w-auto bg-[#4285f4] hover:bg-[#3b78e7] text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Generate Report"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between bg-[#4285f4] text-white py-3 px-6">
          <div className="font-medium flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            <span>Attendance Summary</span>
          </div>
          {reportData.length > 0 && (
            <Button
              onClick={handleExport}
              disabled={exporting}
              variant="outline"
              size="sm"
              className="bg-white hover:bg-gray-100 text-[#4285f4] border-white"
            >
              {exporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export to Excel
                </>
              )}
            </Button>
          )}
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="py-4 px-6 font-medium text-gray-700">
                  Teacher Name
                </TableHead>
                <TableHead className="py-4 px-6 font-medium text-gray-700">
                  Department
                </TableHead>
                <TableHead className="py-4 px-6 font-medium text-gray-700 text-center">
                  Present Days
                </TableHead>
                <TableHead className="py-4 px-6 font-medium text-gray-700 text-center">
                  Absent Days
                </TableHead>
                <TableHead className="py-4 px-6 font-medium text-gray-700 text-center">
                  Late Days
                </TableHead>
                <TableHead className="py-4 px-6 font-medium text-gray-700 text-center">
                  Leave Days
                </TableHead>
                <TableHead className="py-4 px-6 font-medium text-gray-700 text-center">
                  Total Minutes Late
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-[#4285f4] mb-3" />
                      <span className="text-gray-500">
                        Loading report data...
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : reportData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="h-12 w-12 text-gray-300 mb-3" />
                      <h3 className="text-lg font-medium text-gray-700 mb-1">
                        No Report Data
                      </h3>
                      <p className="text-gray-500 max-w-md">
                        Select a department and date range, then click "Generate
                        Report" to view attendance statistics.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                reportData.map((userData) => (
                  <TableRow
                    key={userData.user.id}
                    className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                  >
                    <TableCell className="py-4 px-6 font-medium text-gray-800">
                      {userData.user.name}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-gray-700">
                      {userData.user.department}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 font-medium">
                        {userData.stats.presentCount}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 font-medium">
                        {userData.stats.absentCount}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">
                        {userData.stats.lateCount}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 font-medium">
                        {userData.stats.leaveCount}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium">
                        {userData.stats.totalMinuteLate}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {reportData.length > 0 && totalPages > 1 && (
        <div className="flex flex-col items-center space-y-3 mt-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500">
            Showing page {currentPage} of {totalPages}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
