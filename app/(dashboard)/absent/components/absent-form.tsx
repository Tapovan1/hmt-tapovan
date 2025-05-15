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
import { UserX, AlertCircle, CheckSquare } from "lucide-react";

interface Teacher {
  id: string;
  name: string;
  department: string;
  email: string;
}

interface AbsentFormProps {
  teachers: Teacher[];
}

export function AbsentForm({ teachers }: AbsentFormProps) {
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
      await markTeachersAbsent(selectedTeachers);
      toast.success(
        `Successfully marked ${selectedTeachers.length} teacher(s) as absent`
      );
      setSelectedTeachers([]);
    } catch (error) {
      toast.error("Failed to mark teachers as absent");
      console.error("Error marking teachers absent:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (teachers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="bg-green-50 p-4 rounded-full mb-4">
          <CheckSquare className="h-10 w-10 text-green-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-700">
          All attendance marked for today
        </h3>
        <p className="text-gray-500 mt-2 max-w-md">
          There are no teachers with pending attendance for today. Everyone has
          either marked their attendance or has already been marked absent.
        </p>
      </div>
    );
  }

  return (
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
              Use this form to mark teachers as absent who haven&#39;t recorded
              their attendance today. This action will create an absence record
              for the selected teachers.
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
  );
}
