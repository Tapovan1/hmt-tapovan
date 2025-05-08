import { Suspense } from "react";
import { TeacherLeaveTable } from "./teacher-leave-table";
import { TeacherLeaveDialog } from "./teacher-leave-dialog";

export default function TeacherLeavesPage() {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
  const currentYear = currentDate.getFullYear();

  return (
    <div className="container px-4 py-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Teacher Leave Requests</h1>
        <TeacherLeaveDialog />
      </div>

      <Suspense fallback={<div>Loading leave requests...</div>}>
        <TeacherLeaveTable month={currentMonth} year={currentYear} />
      </Suspense>
    </div>
  );
}
