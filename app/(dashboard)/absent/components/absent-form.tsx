"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { markTeachersAbsent } from "@/lib/action/absent.action";
import { useState } from "react";
import { UserX, AlertCircle, CheckSquare, Download } from "lucide-react";
import * as XLSX from "xlsx";

interface Teacher {
  id: string;
  name: string;
  department: string;
  email: string;
}

interface AbsentFormProps {
  teachers: Teacher[];
  selectedDate?: string;
}

export function AbsentForm({ teachers, selectedDate }: AbsentFormProps) {
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTeachers(teachers.map((teacher) => teacher.id));
    } else {
      setSelectedTeachers([]);
    }
  };

  const handleTeacherSelect = (teacherId: string, checked: boolean) => {
    if (checked) {
      setSelectedTeachers((prev) => [...prev, teacherId]);
    } else {
      setSelectedTeachers((prev) => prev.filter((id) => id !== teacherId));
    }
  };

  const handleSubmit = async () => {
    if (selectedTeachers.length === 0) {
      toast.error("Please select at least one teacher");
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await markTeachersAbsent(selectedTeachers, selectedDate);

      if (result.success) {
        toast.success(
          `Successfully marked ${selectedTeachers.length} teacher(s) as absent`
        );
        setSelectedTeachers([]);
        // Refresh the page to update the list
        // window.location.reload();
      } else {
        toast.error(result.message || "Failed to mark teachers as absent");
      }
    } catch (error) {
      toast.error("Failed to mark teachers as absent");
      console.error("Error marking teachers absent:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportToExcel = () => {
    try {
      // Prepare data for Excel
      const excelData = teachers.map((teacher, index) => ({
        "S.No": index + 1,
        Name: teacher.name,
        Department: teacher.department,
        Email: teacher.email,
      }));

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const columnWidths = [
        { wch: 8 }, // S.No
        { wch: 25 }, // Name
        { wch: 20 }, // Department
        { wch: 30 }, // Email
      ];
      worksheet["!cols"] = columnWidths;

      // Use selected date or current date for title
      const displayDate = selectedDate
        ? new Date(selectedDate).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          });

      // Add title row
      XLSX.utils.sheet_add_aoa(
        worksheet,
        [[`Staff Without Attendance - ${displayDate}`]],
        { origin: "A1" }
      );

      // Merge title cells
      worksheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }];

      // Move data down by 2 rows to accommodate title
      const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
      for (let row = range.e.r; row >= 1; row--) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const oldCell = XLSX.utils.encode_cell({ r: row, c: col });
          const newCell = XLSX.utils.encode_cell({ r: row + 2, c: col });
          if (worksheet[oldCell]) {
            worksheet[newCell] = worksheet[oldCell];
            delete worksheet[oldCell];
          }
        }
      }

      // Update range
      worksheet["!ref"] = XLSX.utils.encode_range({
        s: { r: 0, c: 0 },
        e: { r: teachers.length + 2, c: 4 },
      });

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Absent Teachers");

      // Generate filename with selected date or current date
      const fileDate = selectedDate || new Date().toISOString().split("T")[0];
      const filename = `absent-teachers-${fileDate}.xlsx`;

      // Save file
      XLSX.writeFile(workbook, filename);

      toast.success("Excel file downloaded successfully!");
    } catch (error) {
      toast.error("Failed to generate Excel file");
      console.error("Error generating Excel:", error);
    }
  };

  if (teachers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="bg-green-50 p-4 rounded-full mb-4">
          <CheckSquare className="h-10 w-10 text-green-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-700">
          All attendance marked for selected date
        </h3>
        <p className="text-gray-500 mt-2 max-w-md">
          There are no teachers with pending attendance for the selected date.
          Everyone has either marked their attendance or has already been marked
          absent.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end px-6 mt-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleExportToExcel}
          className="bg-[#4285f4] hover:bg-[#3b78e7] hover:text-white text-white flex items-center"
        >
          <Download className="h-4 w-4" />
          Export to Excel
        </Button>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-md mx-6 mt-4 flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-amber-800 text-sm">
                Use this form to mark teachers as absent who haven&#39;t
                recorded their attendance for the selected date. This action
                will create an absence record for the selected teachers.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="py-4 px-6 font-medium text-gray-700 w-16">
                    <Checkbox
                      checked={selectedTeachers.length === teachers.length}
                      onCheckedChange={handleSelectAll}
                      className="h-5 w-5 border-gray-300 text-[#4285f4] rounded"
                    />
                  </TableHead>
                  <TableHead className="py-4 px-6 font-medium text-gray-700">
                    Name
                  </TableHead>
                  <TableHead className="py-4 px-6 font-medium text-gray-700">
                    Department
                  </TableHead>
                  <TableHead className="py-4 px-6 font-medium text-gray-700">
                    Email
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.map((teacher) => (
                  <TableRow
                    key={teacher.id}
                    className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                  >
                    <TableCell className="py-4 px-6">
                      <Checkbox
                        checked={selectedTeachers.includes(teacher.id)}
                        onCheckedChange={(checked) =>
                          handleTeacherSelect(teacher.id, checked as boolean)
                        }
                        className="h-5 w-5 border-gray-300 text-[#4285f4] rounded"
                      />
                    </TableCell>
                    <TableCell className="py-4 px-6 font-medium text-gray-800">
                      {teacher.name}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-gray-700">
                      {teacher.department}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-gray-700">
                      {teacher.email}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              {selectedTeachers.length > 0 ? (
                <span>{selectedTeachers.length} teacher(s) selected</span>
              ) : (
                <span>No teachers selected</span>
              )}
            </div>
            <Button
              type="submit"
              className="bg-[#4285f4] hover:bg-[#3b78e7] text-white flex items-center"
              disabled={selectedTeachers.length === 0 || isSubmitting}
            >
              <UserX className="mr-2 h-4 w-4" />
              {isSubmitting ? "Processing..." : "Mark Selected as Absent"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
