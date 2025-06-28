"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/date-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Download,
  FileText,
  CalendarRange,
  Building2,
  AlertTriangle,
  Edit,
  Save,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { saveEmployeePenalty } from "@/lib/action/penalty.action";
import { exportSalaryToExcel, getSalaryData } from "@/lib/action/export-salary";
import { getMonthFromDate } from "@/lib/utils/month";

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

  // Penalty modal states
  const [penaltyModalOpen, setPenaltyModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [penaltyAmount, setPenaltyAmount] = useState<number>(0);

  const [savingPenalty, setSavingPenalty] = useState(false);

  const handleOpenPenaltyModal = (employee: any) => {
    setSelectedEmployee(employee);
    setPenaltyAmount(employee.penalty || 0);

    setPenaltyModalOpen(true);
  };

  const handleSavePenalty = async () => {
    if (!selectedEmployee || !startDate) {
      toast.error("Missing required information");
      return;
    }

    if (penaltyAmount < 0) {
      toast.error("Penalty amount cannot be negative");
      return;
    }

    // if (penaltyAmount > 0) {
    //   toast.error("Please provide a reason for the penalty");
    //   return;
    // }

    setSavingPenalty(true);
    try {
      // Get month from start date
      const adjustedStartDate = new Date(startDate);
      adjustedStartDate.setDate(adjustedStartDate.getDate() + 1);
      adjustedStartDate.setHours(0, 0, 0, 0);

      const month = getMonthFromDate(adjustedStartDate);
      console.log("Saving penalty for month:", month);

      await saveEmployeePenalty({
        userId: selectedEmployee.id,
        employeeName: selectedEmployee.name,
        department: selectedEmployee.department,
        amount: penaltyAmount,

        month: month,
      });

      // Update the local data
      setSalaryData((prevData) =>
        prevData.map((emp) =>
          emp.id === selectedEmployee.id
            ? {
                ...emp,
                penalty: penaltyAmount,

                total: emp.paySalary02 - emp.proTax - penaltyAmount,
              }
            : emp
        )
      );

      toast.success(`Penalty saved for ${month}`);
      setPenaltyModalOpen(false);
      setPenaltyAmount(0);
    } catch (error) {
      console.error("Error saving penalty:", error);
      toast.error("Failed to save penalty. Please try again.");
    } finally {
      setSavingPenalty(false);
    }
  };

  const handleExportSalary = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
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
      const buffer = await exportSalaryToExcel({
        department: selectedDepartment,
        start: adjustedStartDate,
        end: adjustedEndDate,
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
      toast.success("Salary report exported successfully");
    } catch (error) {
      console.error("Error exporting salary data:", error);
      toast.error("Failed to export salary data. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const handlePreviewSalaryData = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    setLoading(true);
    const adjustedStartDate = new Date(startDate);
    const adjustedEndDate = new Date(endDate);
    adjustedStartDate.setDate(adjustedStartDate.getDate() + 1);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
    adjustedStartDate.setHours(0, 0, 0, 0);
    adjustedEndDate.setHours(0, 0, 0, 0);

    try {
      const month = getMonthFromDate(adjustedStartDate);
      console.log("Fetching salary data for month:", month);

      const data = await getSalaryData({
        department: selectedDepartment,
        start: adjustedStartDate,
        end: adjustedEndDate,
      });

      console.log("Received salary data:", data.length, "records");
      setSalaryData(data);

      if (data.length === 0) {
        toast.info("No salary data found for the selected criteria");
      } else {
        toast.success(`Loaded ${data.length} employee records for ${month}`);
      }
    } catch (error) {
      console.error("Error generating preview data:", error);
      toast.error("Failed to generate preview data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatMonthRange = () => {
    if (!startDate || !endDate) return "";
    const start = startDate.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
    const end = endDate.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
    return start === end ? start : `${start} - ${end}`;
  };

  const getCurrentMonth = () => {
    if (!startDate) return "";
    const adjustedStartDate = new Date(startDate);
    adjustedStartDate.setDate(adjustedStartDate.getDate() + 1);
    return getMonthFromDate(adjustedStartDate);
  };

  const getTotalPenalties = () => {
    return salaryData.reduce((sum, emp) => sum + (emp.penalty || 0), 0);
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-[#e6eef8] p-3 rounded-full">
          <FileText className="h-6 w-6 text-[#4285f4]" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Salary Report
        </h1>
      </div>

      <Card className="mb-2 border-gray-100 shadow-sm">
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

            <div className="flex items-end">
              <Button
                onClick={handlePreviewSalaryData}
                disabled={loading}
                className="h-10 w-full bg-[#4285f4] hover:bg-[#3b78e7] text-white"
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
          </div>

          {startDate && endDate && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Month Range:</span>{" "}
                  {formatMonthRange()}
                  {getCurrentMonth() && (
                    <span className="ml-4 font-medium">
                      Penalty Month: {getCurrentMonth()}
                    </span>
                  )}
                </p>
                {salaryData.length > 0 && getTotalPenalties() > 0 && (
                  <Badge
                    variant="destructive"
                    className="bg-red-100 text-red-800"
                  >
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Total Penalties: ₹{getTotalPenalties().toFixed(2)}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between bg-[#4285f4] text-white py-3 px-6">
          <div className="font-medium flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            <span>Salary Summary</span>
          </div>
          {salaryData.length > 0 && (
            <Button
              onClick={handleExportSalary}
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
                <TableHead className="py-3 px-4 text-center font-medium text-gray-700">
                  NO
                </TableHead>
                <TableHead className="py-3 px-4 text-center font-medium text-gray-700">
                  NAME
                </TableHead>
                <TableHead className="py-3 px-4 text-center font-medium text-gray-700">
                  DEPARTMENT
                </TableHead>
                <TableHead className="py-3 px-4 text-center font-medium text-gray-700">
                  SALARY
                </TableHead>
                <TableHead className="py-3 px-4 text-center font-medium text-gray-700">
                  MONTH DAYS
                </TableHead>
                <TableHead className="py-3 px-4 text-center font-medium text-gray-700">
                  HAJAR DIVAS
                </TableHead>
                <TableHead className="py-3 px-4 text-center font-medium text-gray-700">
                  OFF DAYS
                </TableHead>
                <TableHead className="py-3 px-4 text-center font-medium text-gray-700">
                  LATE TIME
                </TableHead>
                <TableHead className="py-3 px-4 text-center font-medium text-gray-700">
                  LATE TIME CHA.
                </TableHead>
                <TableHead className="py-3 px-4 text-center font-medium text-gray-700">
                  SALARY
                </TableHead>
                <TableHead className="py-3 px-4 text-center font-medium text-gray-700">
                  PRO TAX
                </TableHead>
                <TableHead className="py-3 px-4 text-center font-medium text-gray-700 bg-red-50">
                  PENALTY
                </TableHead>
                <TableHead className="py-3 px-4 text-center font-medium text-gray-700">
                  TOTAL
                </TableHead>
                <TableHead className="py-3 px-4 text-center font-medium text-gray-700">
                  ACTION
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={14} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-[#4285f4] mb-3" />
                      <span className="text-gray-500">
                        Loading salary data...
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : salaryData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={14} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="h-12 w-12 text-gray-300 mb-3" />
                      <h3 className="text-lg font-medium text-gray-700 mb-1">
                        No Salary Data
                      </h3>
                      <p className="text-gray-500 max-w-md">
                        Select a department and date range, then click "Preview
                        Salary" to view salary statistics.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                salaryData.map((item) => (
                  <TableRow
                    key={item.id}
                    className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                  >
                    <TableCell className="py-3 px-4 text-center">
                      {item.no}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-center font-medium text-gray-800">
                      {item.name}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-center text-gray-700">
                      {item.department}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-center text-gray-700">
                      {item.salary}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-center text-gray-700">
                      {item.daysInMonth}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-center text-gray-700">
                      {item.hajarDivas}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-center text-gray-700">
                      {item.off}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-center text-gray-700">
                      {item.lateTime}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-center text-gray-700">
                      {item.paySalary01}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-center text-gray-700">
                      {item.paySalary02}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-center text-gray-700">
                      {item.proTax}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-center bg-red-50">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-red-600 font-medium">
                          -{(item.penalty || 0).toFixed(2)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4 text-center font-medium text-gray-800">
                      {item.total.toFixed(2)}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-center">
                      <Dialog
                        open={
                          penaltyModalOpen && selectedEmployee?.id === item.id
                        }
                        onOpenChange={setPenaltyModalOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenPenaltyModal(item)}
                            className="h-8 w-8 p-0 border-orange-200 hover:bg-orange-50"
                          >
                            <Edit className="h-3 w-3 text-orange-600" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-orange-500" />
                              Set Penalty for {selectedEmployee?.name}
                              {getCurrentMonth() && (
                                <Badge variant="outline" className="ml-2">
                                  {getCurrentMonth()}
                                </Badge>
                              )}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="penalty-amount">
                                Penalty Amount (₹)
                              </Label>
                              <Input
                                id="penalty-amount"
                                type="number"
                                value={penaltyAmount}
                                onChange={(e) =>
                                  setPenaltyAmount(Number(e.target.value) || 0)
                                }
                                placeholder="0"
                                min="0"
                                step="0.01"
                              />
                            </div>

                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() => setPenaltyModalOpen(false)}
                                disabled={savingPenalty}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                              </Button>
                              <Button
                                onClick={handleSavePenalty}
                                disabled={savingPenalty}
                                className="bg-orange-600 hover:bg-orange-700"
                              >
                                {savingPenalty ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Saving...
                                  </>
                                ) : (
                                  <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Penalty
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
