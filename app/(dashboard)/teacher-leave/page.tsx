import { Suspense } from "react";
import { TeacherLeaveTable } from "./teacher-leave-table";
import { TeacherLeaveDialog } from "./teacher-leave-dialog";
import { CalendarDays } from "lucide-react";
import DateSelector from "@/components/month-year";

export default function TeacherLeavesPage() {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
  const currentYear = currentDate.getFullYear();

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-[#eef5ff] p-3 rounded-full">
            <CalendarDays className="h-6 w-6 text-[#4285f4]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Leave Requests
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <TeacherLeaveDialog />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="bg-[#4285f4] text-white py-3 px-6 font-medium">
          My Leave Requests
        </div>
        <Suspense fallback={<LeaveTableSkeleton />}>
          <TeacherLeaveTable month={currentMonth} year={currentYear} />
        </Suspense>
      </div>
    </div>
  );
}

function LeaveTableSkeleton() {
  return (
    <div className="p-6">
      <div className="h-8 bg-gray-200 rounded-md w-full max-w-md mb-4 animate-pulse"></div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 bg-gray-100 rounded-md w-full animate-pulse"
          ></div>
        ))}
      </div>
    </div>
  );
}
