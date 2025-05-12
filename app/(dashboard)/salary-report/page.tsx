"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { exportSalaryToExcel, getSalaryData } from "@/lib/action/export-salary";

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

export default function SalaryReportPage() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [salaryData, setSalaryData] = useState<any[]>([]);

  const handleExportSalary = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates");
      return;
    }

    setExporting(true);
    try {
      const buffer = await exportSalaryToExcel({
        department: selectedDepartment,
        start: startDate,
        end: endDate,
      });

      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `salary-report-${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting salary data:", error);
      alert("Failed to export salary data. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const handlePreviewSalaryData = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates");
      return;
    }

    setLoading(true);
    try {
      const data = await getSalaryData({
        department: selectedDepartment,
        start: startDate,
        end: endDate,
      });
      setSalaryData(data);
    } catch (error) {
      console.error("Error generating preview data:", error);
      alert("Failed to generate preview data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-3 px-3 md:px-6">
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <h1 className="text-2xl font-bold">Salary Report</h1>
        <Button
          onClick={handleExportSalary}
          disabled={exporting || salaryData.length === 0}
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
              Export Salary to Excel
            </>
          )}
        </Button>
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
          onClick={handlePreviewSalaryData}
          disabled={loading}
          className="w-full sm:w-auto min-w-[100px]"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            "Preview Salary"
          )}
        </Button>
      </div>

      {/* Table wrapper without fixed max-width */}
      <div className="rounded-lg border shadow-sm overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-center font-semibold">NO</TableHead>
              <TableHead className="text-center font-semibold">NAME</TableHead>
              <TableHead className=" text-center font-semibold">
                DEPARTMENT
              </TableHead>
              <TableHead className=" text-center font-semibold">
                SALARY
              </TableHead>
              <TableHead className="text-center font-semibold">
                LATE TIME
              </TableHead>
              <TableHead className="text-centerfont-semibold">OFF</TableHead>
              <TableHead className="text-center font-semibold">
                HAJAR DIVAS
              </TableHead>
              <TableHead className="text-centerfont-semibold">
                PAY SALARY 01
              </TableHead>
              <TableHead className="text-center font-semibold">
                PAY SALARY 02
              </TableHead>
              <TableHead className=" text-center font-semibold">
                PRO TAX
              </TableHead>
              <TableHead className="text-center font-semibold">TOTAL</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={11} className="py-8 text-center">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span className="text-muted-foreground">
                      Loading data...
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : salaryData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={11}
                  className="py-8 text-center text-muted-foreground"
                >
                  No data available. Please select dates and click "Preview
                  Salary".
                </TableCell>
              </TableRow>
            ) : (
              salaryData.map((item) => (
                <TableRow key={item.no} className="hover:bg-muted/50">
                  <TableCell className=" text-center">{item.no}</TableCell>
                  <TableCell className=" text-center font-medium">
                    {item.name}
                  </TableCell>
                  <TableCell className="text-center">
                    {item.department}
                  </TableCell>
                  <TableCell className=" text-center">{item.salary}</TableCell>
                  <TableCell className=" text-center">
                    {item.lateTime}
                  </TableCell>
                  <TableCell className=" text-center">{item.off}</TableCell>
                  <TableCell className=" text-center">
                    {item.hajarDivas}
                  </TableCell>
                  <TableCell className=" text-center">
                    {item.paySalary01.toFixed(2)}
                  </TableCell>
                  <TableCell className=" text-center">
                    {item.paySalary02.toFixed(2)}
                  </TableCell>
                  <TableCell className=" text-center">{item.proTax}</TableCell>
                  <TableCell className=" text-center font-medium">
                    {item.total.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
