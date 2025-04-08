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
      await markTeachersAbsent(selectedTeachers);
      toast.success("Successfully marked selected teachers as absent");
      setSelectedTeachers([]);
    } catch {
      toast.error("Failed to mark teachers as absent");
    }
  };

  return (
    <form action={handleSubmit}>
      <div className="space-y-4">
        {teachers.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No teachers pending attendance for today
          </div>
        ) : (
          <>
            <div className="rounded-lg border shadow-sm overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="py-4 px-3 md:px-6 font-semibold">
                      <Checkbox
                        checked={selectedTeachers.length === teachers.length}
                        onCheckedChange={handleSelectAll}
                        className="h-4 w-4"
                      />
                    </TableHead>
                    <TableHead className="py-4 px-3 md:px-6 font-semibold">
                      Name
                    </TableHead>
                    <TableHead className="py-4 px-3 md:px-6 font-semibold">
                      Department
                    </TableHead>
                    <TableHead className="py-4 px-3 md:px-6 font-semibold">
                      Email
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.map((teacher) => (
                    <TableRow key={teacher.id} className="hover:bg-muted/50">
                      <TableCell className="py-4 px-3 md:px-6">
                        <Checkbox
                          checked={selectedTeachers.includes(teacher.id)}
                          onCheckedChange={(checked) =>
                            handleTeacherSelect(teacher.id, checked as boolean)
                          }
                          className="h-4 w-4"
                        />
                      </TableCell>
                      <TableCell className="py-4 px-3 md:px-6">
                        {teacher.name}
                      </TableCell>
                      <TableCell className="py-4 px-3 md:px-6">
                        {teacher.department}
                      </TableCell>
                      <TableCell className="py-4 px-3 md:px-6">
                        {teacher.email}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end">
              <Button type="submit">Mark Selected as Absent</Button>
            </div>
          </>
        )}
      </div>
    </form>
  );
}
