import { Suspense } from "react";
import { getDashboardStats } from "@/lib/action/dashboard.action";
import DashboardStats from "@/components/Dashboard/DashboardStats";
import RecentAttendance from "@/components/Dashboard/RecentAttendnace";
import QuickActions from "@/components/Dashboard/quickAction";
import DashboardSkeleton from "@/components/Dashboard/DashboardSkeleton";
import DateSelector from "@/components/month-year";

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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Independence Day Header Banner */}
      <div className="bg-gradient-to-r from-orange-500 via-white to-green-600 p-1">
        <div className="bg-white mx-1 rounded-lg">
          <div className="text-center py-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">🇮🇳</span>
              <h2 className="text-xl font-bold bg-gradient-to-r from-orange-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
                Happy Independence Day 2025
              </h2>
              <span className="text-2xl">🇮🇳</span>
            </div>
            <p className="text-sm text-gray-600 font-medium">
              Celebrating 79 Years of Freedom • August 15th • Jai Hind! 🙏
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header with Date Selector */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-orange-200 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-white to-green-600"></div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="flex items-center">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
                  Welcome Back, {user.name} 🇮🇳
                </h1>
                <p className="text-sm text-gray-600 mt-1 font-medium">
                  "Freedom is not given, it is taken" - Netaji Subhas Chandra
                  Bose
                </p>
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
    monthlyStats: {
      ...rawStats.monthlyStats,
      totalMinuteLate: String(rawStats.monthlyStats.totalMinuteLate),
    },
  };

  return (
    <>
      {/* Stats Grid */}
      <div className="w-full">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
            Attendance Overview
          </h2>
          <span className="text-lg">📊</span>
        </div>
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
              checkOut: attendance.checkOut
                ? attendance.checkOut.toISOString()
                : undefined,
              status: attendance.status as "PRESENT" | "LATE" | "ABSENT",
            }))}
          />
        </Suspense>
        <QuickActions />
      </div>

      {/* Independence Day Footer Message */}
      <div className="bg-gradient-to-r from-orange-100 via-white to-green-100 rounded-xl p-6 border-2 border-orange-200 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-xl">🏛️</span>
          <h3 className="text-lg font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
            Unity in Diversity
          </h3>
          <span className="text-xl">🕊️</span>
        </div>
        <p className="text-sm text-gray-700 font-medium">
          Let's continue building a stronger, more prosperous India together! 🇮🇳
        </p>
      </div>
    </>
  );
}
