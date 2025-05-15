import { Suspense } from "react";
import { CalendarDays } from "lucide-react";
import { AdminTeacherLeaveStats } from "./admin-teacher-leave-stats";
import { AdminTeacherLeaveTable } from "./admin-teacher-leave-table";
import { getFilteredTeacherLeaves } from "@/lib/action/admin-teacher-leave.action";

export default async function AdminTeacherLeavePage() {
  // Check if the user is an admin
  const rawLeaves = await getFilteredTeacherLeaves({});
  const leaves = rawLeaves.map((leave) => ({
    ...leave,
    totalDays: leave.totalDays ?? undefined,
  }));

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-[#e6eef8] p-3 rounded-full">
          <CalendarDays className="h-6 w-6 text-[#4285f4]" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Teacher Leave Management
        </h1>
      </div>

      <Suspense
        fallback={
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-[120px] animate-pulse"
              >
                <div className="h-5 w-24 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 w-16 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        }
      >
        <AdminTeacherLeaveStats />
      </Suspense>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 mt-6">
        <div className="bg-[#4285f4] text-white py-3 px-6 rounded-t-lg font-medium flex items-center justify-between">
          <span>Leave Requests</span>
          <Suspense
            fallback={
              <div className="h-9 w-40 bg-white/20 rounded animate-pulse"></div>
            }
          ></Suspense>
        </div>

        <div className="p-6">
          <Suspense
            fallback={
              <div className="w-full h-64 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 border-4 border-t-[#4285f4] border-[#e6eef8] rounded-full animate-spin"></div>
                  <p className="text-gray-500">Loading leave requests...</p>
                </div>
              </div>
            }
          >
            <AdminTeacherLeaveTable leaves={leaves} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
