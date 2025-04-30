"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getReportData,
  type ReportData,
} from "../../../lib/action/report.actions";
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
import { Loader2, Download } from "lucide-react";
import { exportToExcel } from "@/lib/action/export.actions";
import { Pagination } from "@/components/pagination";

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

  const handleFetchData = async (page: number = 1) => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates");
      return;
    }

    setLoading(true);
    try {
      const { data, totalPages } = await getReportData({
        department: selectedDepartment,
        start: startDate,
        end: endDate,
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
      alert("Please select both start and end dates");
      return;
    }

    setExporting(true);
    try {
      const buffer = await exportToExcel({
        department: selectedDepartment,
        start: startDate,
        end: endDate,
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
    <div className="container mx-auto py-3 px-3 md:px-6">
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <h1 className="text-2xl font-bold">Teacher Attendance Report</h1>
        {reportData.length > 0 && (
          <Button
            onClick={handleExport}
            disabled={exporting}
            variant="outline"
            className="flex items-center gap-2"
          >
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export to Excel
              </>
            )}
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4 md:mb-6">
        <Select
          value={selectedDepartment}
          onValueChange={setSelectedDepartment}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
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

        <div className="w-full sm:w-auto">
          <DatePicker
            date={startDate}
            setDate={setStartDate}
            placeholder="Start Date"
          />
        </div>

        <div className="w-full sm:w-auto">
          <DatePicker
            date={endDate}
            setDate={setEndDate}
            placeholder="End Date"
          />
        </div>

        <Button
          onClick={() => handleFetchData(1)}
          disabled={loading}
          className="w-full sm:w-auto min-w-[100px]"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            "Fetch Data"
          )}
        </Button>
      </div>
      <div className="rounded-lg border shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="py-4 px-3 md:px-6 font-semibold">
                Teacher Name
              </TableHead>
              <TableHead className="py-4 px-3 md:px-6 font-semibold">
                Department
              </TableHead>
              <TableHead className="py-4 px-3 md:px-6 font-semibold">
                Present Days
              </TableHead>
              <TableHead className="py-4 px-3 md:px-6 font-semibold">
                Absent Days
              </TableHead>
              <TableHead className="py-4 px-3 md:px-6 font-semibold">
                Late Days
              </TableHead>
              <TableHead className="py-4 px-3 md:px-6 font-semibold">
                Total Work Hours
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span className="text-muted-foreground">
                      Loading data...
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : reportData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-muted-foreground"
                >
                  No data available. Please select dates and click &quot;Fetch
                  Data&quot;.
                </TableCell>
              </TableRow>
            ) : (
              reportData.map((userData) => (
                <TableRow key={userData.user.id} className="hover:bg-muted/50">
                  <TableCell className="py-4 px-3 md:px-6">
                    {userData.user.name}
                  </TableCell>
                  <TableCell className="py-4 px-3 md:px-6">
                    {userData.user.department}
                  </TableCell>
                  <TableCell className="py-4 px-3 md:px-6">
                    {userData.stats.presentCount}
                  </TableCell>
                  <TableCell className="py-4 px-3 md:px-6">
                    {userData.stats.absentCount}
                  </TableCell>
                  <TableCell className="py-4 px-3 md:px-6">
                    {userData.stats.lateCount}
                  </TableCell>
                  <TableCell className="py-4 px-3 md:px-6">
                    {userData.stats.totalWorkHours}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {reportData.length > 0 && (
        <div className="mt-4">
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
