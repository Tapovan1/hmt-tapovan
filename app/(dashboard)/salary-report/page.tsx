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
  Search,
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
    <div className="max-w-full mx-auto p-4 space-y-4">
      {/* Compact Header */}
      <div className="flex items-center gap-2">
        <div className="bg-blue-100 p-2 rounded-lg">
          <FileText className="h-5 w-5 text-blue-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-800">Salary Report</h1>
      </div>

      {/* Compact Filter Section */}
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-3">
            {/* Department Filter */}
            <div className="min-w-[180px]">
              <Label className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                Department
              </Label>
              <Select
                value={selectedDepartment}
                onValueChange={setSelectedDepartment}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="All Departments" />
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

            {/* Start Date */}
            <div className="min-w-[140px]">
              <Label className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                <CalendarRange className="h-3 w-3" />
                Start Date
              </Label>
              <DatePicker
                date={startDate}
                setDate={setStartDate}
                placeholder="Start date"
              />
            </div>

            {/* End Date */}
            <div className="min-w-[140px]">
              <Label className="text-xs font-medium text-gray-600 mb-1">
                End Date
              </Label>
              <DatePicker
                date={endDate}
                setDate={setEndDate}
                placeholder="End date"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handlePreviewSalaryData}
                disabled={loading}
                size="sm"
                className="h-8 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Search className="h-3 w-3" />
                )}
                <span className="ml-1">Preview</span>
              </Button>

              {salaryData.length > 0 && (
                <Button
                  onClick={handleExportSalary}
                  disabled={exporting}
                  variant="outline"
                  size="sm"
                  className="h-8 bg-transparent"
                >
                  {exporting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Download className="h-3 w-3" />
                  )}
                  <span className="ml-1">Export</span>
                </Button>
              )}
            </div>
          </div>

          {/* Compact Info Bar */}
          {startDate && endDate && (
            <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-800">
                  <strong>Period:</strong> {formatMonthRange()}
                  {getCurrentMonth() && (
                    <span className="ml-4">
                      <strong>Penalty Month:</strong> {getCurrentMonth()}
                    </span>
                  )}
                </span>
                {salaryData.length > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="text-blue-800">
                      <strong>Records:</strong> {salaryData.length}
                    </span>
                    {getTotalPenalties() > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Total Penalties: ₹{getTotalPenalties().toFixed(2)}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compact Table */}
      <Card className="border-gray-200">
        <div className="bg-blue-600 text-white py-2 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <FileText className="h-4 w-4" />
            Salary Summary
          </div>
        </div>

        <div className="overflow-auto max-h-[70vh]">
          <Table className="text-sm">
            <TableHeader className="sticky top-0 bg-gray-50">
              <TableRow>
                <TableHead className="h-8 px-2 text-center text-xs font-medium">
                  NO
                </TableHead>
                <TableHead className="h-8 px-2 text-center text-xs font-medium min-w-[120px]">
                  NAME
                </TableHead>
                <TableHead className="h-8 px-2 text-center text-xs font-medium">
                  DEPT
                </TableHead>
                <TableHead className="h-8 px-2 text-center text-xs font-medium">
                  SALARY
                </TableHead>
                <TableHead className="h-8 px-2 text-center text-xs font-medium">
                  M.DAYS
                </TableHead>
                <TableHead className="h-8 px-2 text-center text-xs font-medium">
                  H.DIVAS
                </TableHead>
                <TableHead className="h-8 px-2 text-center text-xs font-medium">
                  OFF
                </TableHead>
                <TableHead className="h-8 px-2 text-center text-xs font-medium">
                  LATE
                </TableHead>
                <TableHead className="h-8 px-2 text-center text-xs font-medium">
                  L.CHA
                </TableHead>
                <TableHead className="h-8 px-2 text-center text-xs font-medium">
                  PAY
                </TableHead>
                <TableHead className="h-8 px-2 text-center text-xs font-medium">
                  TAX
                </TableHead>
                <TableHead className="h-8 px-2 text-center text-xs font-medium bg-red-50">
                  PENALTY
                </TableHead>
                <TableHead className="h-8 px-2 text-center text-xs font-medium">
                  TOTAL
                </TableHead>
                <TableHead className="h-8 px-2 text-center text-xs font-medium">
                  ACTION
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={14} className="py-8 text-center">
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600 mb-2" />
                      <span className="text-gray-500 text-sm">
                        Loading salary data...
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : salaryData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={14} className="py-8 text-center">
                    <div className="flex flex-col items-center">
                      <FileText className="h-8 w-8 text-gray-300 mb-2" />
                      <h3 className="text-sm font-medium text-gray-700 mb-1">
                        No Salary Data
                      </h3>
                      <p className="text-gray-500 text-xs max-w-md">
                        Select a department and date range, then click "Preview
                        Salary" to view salary statistics.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                salaryData.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50">
                    <TableCell className="h-8 px-2 text-center text-xs">
                      {item.no}
                    </TableCell>
                    <TableCell className="h-8 px-2 text-center text-xs font-medium">
                      {item.name}
                    </TableCell>
                    <TableCell className="h-8 px-2 text-center text-xs">
                      {item.department}
                    </TableCell>
                    <TableCell className="h-8 px-2 text-center text-xs">
                      {item.salary}
                    </TableCell>
                    <TableCell className="h-8 px-2 text-center text-xs">
                      {item.daysInMonth}
                    </TableCell>
                    <TableCell className="h-8 px-2 text-center text-xs">
                      {item.hajarDivas}
                    </TableCell>
                    <TableCell className="h-8 px-2 text-center text-xs">
                      {item.off}
                    </TableCell>
                    <TableCell className="h-8 px-2 text-center text-xs">
                      {item.lateTime}
                    </TableCell>
                    <TableCell className="h-8 px-2 text-center text-xs">
                      {item.paySalary01}
                    </TableCell>
                    <TableCell className="h-8 px-2 text-center text-xs">
                      {item.paySalary02}
                    </TableCell>
                    <TableCell className="h-8 px-2 text-center text-xs">
                      {item.proTax}
                    </TableCell>
                    <TableCell className="h-8 px-2 text-center text-xs bg-red-50">
                      <span className="text-red-600 font-medium">
                        -{(item.penalty || 0).toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="h-8 px-2 text-center text-xs font-medium">
                      {item.total.toFixed(2)}
                    </TableCell>
                    <TableCell className="h-8 px-2 text-center">
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
                            className="h-6 w-6 p-0 border-orange-200 hover:bg-orange-50"
                          >
                            <Edit className="h-3 w-3 text-orange-600" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-base">
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                              Set Penalty for {selectedEmployee?.name}
                              {getCurrentMonth() && (
                                <Badge
                                  variant="outline"
                                  className="ml-2 text-xs"
                                >
                                  {getCurrentMonth()}
                                </Badge>
                              )}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label
                                htmlFor="penalty-amount"
                                className="text-sm"
                              >
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
                                className="h-8"
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() => setPenaltyModalOpen(false)}
                                disabled={savingPenalty}
                                size="sm"
                              >
                                <X className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                              <Button
                                onClick={handleSavePenalty}
                                disabled={savingPenalty}
                                size="sm"
                                className="bg-orange-600 hover:bg-orange-700"
                              >
                                {savingPenalty ? (
                                  <>
                                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                    Saving...
                                  </>
                                ) : (
                                  <>
                                    <Save className="h-3 w-3 mr-1" />
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
      </Card>
    </div>
  );
}
