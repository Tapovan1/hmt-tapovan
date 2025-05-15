import { Suspense } from "react";
import { getDashboardStats } from "@/lib/action/dashboard.action";
import DashboardStats from "@/components/Dashboard/DashboardStats";
import RecentAttendance from "@/components/Dashboard/RecentAttendnace";
import QuickActions from "@/components/Dashboard/quickAction";
import DashboardSkeleton from "@/components/Dashboard/DashboardSkeleton";
import DateSelector from "@/components/month-year";
import { User } from "lucide-react";

interface Employee {
  id: string;
  name: string;
}

export default async function EmployeeDashboard({
  user,
  searchParams = {},
}: {
  user: Employee;
  searchParams?: { month?: number; year?: number };
}) {
  const { month: monthParam, year: yearParam } = await searchParams;
  const parsedMonth = monthParam;
  const parsedYear = yearParam;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header with Date Selector */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div className="flex items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Welcome Back, {user.name} 👋
              </h1>
            </div>
          </div>
          <DateSelector />
        </div>
      </div>

      {/* Dashboard Content */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent
          userId={user.id}
          month={parsedMonth}
          year={parsedYear}
        />
      </Suspense>
    </div>
  );
}

async function DashboardContent({
  userId,
  month,
  year,
}: {
  userId: string;
  month?: number;
  year?: number;
}) {
  const rawStats = await getDashboardStats(userId, month, year);
  const stats = {
    ...rawStats,
    todayStatus: [
      "PRESENT",
      "LATE",
      "ABSENT",
      "NOT_MARKED",
      "ON_LEAVE",
    ].includes(rawStats.todayStatus)
      ? (rawStats.todayStatus as
          | "PRESENT"
          | "LATE"
          | "ABSENT"
          | "NOT_MARKED"
          | "ON_LEAVE")
      : undefined,
  };

  return (
    <>
      {/* Stats Grid */}
      <div className="w-full">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Attendance Overview
        </h2>
        <div className="grid ">
          <DashboardStats stats={stats} />
        </div>
      </div>

      {/* Recent Attendance and Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Suspense
          fallback={
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              Loading...
            </div>
          }
        >
          <RecentAttendance
            recentAttendance={stats.recentAttendance.map((attendance) => ({
              date: attendance.date.toISOString(),
              checkIn: attendance.checkIn
                ? attendance.checkIn.toISOString()
                : undefined,
              status: attendance.status as "PRESENT" | "LATE" | "ABSENT",
            }))}
          />
        </Suspense>
        <QuickActions />
      </div>
    </>
  );
}
