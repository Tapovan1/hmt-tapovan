import { Suspense } from "react";
import { getDashboardStats } from "@/lib/action/dashboard.action";
import DashboardStats from "@/components/Dashboard/DashboardStats";
import DashboardSkeleton from "@/components/Dashboard/DashboardSkeleton";
import DateSelector from "@/components/month-year";
import { notFound } from "next/navigation";
import { getEmployeeById } from "@/lib/action/admin.action";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User } from "lucide-react";
import { getAttendanceHistory } from "@/lib/action/history.action";
import { HistoryTable } from "@/components/Dashboard/HistoryTable";
import { HistoryTableSkeleton } from "@/components/Dashboard/HistoryTableSkeleton";
import { PDFExport } from "./PDFExport";

export default async function EmployeeHistoryPage({
  params,
  searchParams = {},
}: {
  params: { id: string };
  searchParams?: { month?: string; year?: string };
}) {
  // Await params to get the id
  const { id } = await params;
  const { month: monthParam, year: yearParam } = await searchParams;

  // Validate that id exists
  if (!id) {
    notFound();
  }

  // Get employee data to verify employee exists and get name
  const employee = await getEmployeeById(id);
  if (!employee) {
    notFound();
  }

  // Parse month and year from search params
  const parsedMonth = monthParam ? Number.parseInt(monthParam) : undefined;
  const parsedYear = yearParam ? Number.parseInt(yearParam) : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                {employee.name} - Attendance History
              </h1>
              <p className="text-slate-600 mt-1">
                View attendance records and statistics
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              asChild
              className="border-slate-200 hover:bg-slate-50 w-fit bg-transparent"
            >
              <Link href="/employee">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Employees
              </Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="border-slate-200 hover:bg-slate-50 w-fit bg-transparent"
            >
              <Link href={`/employee/${id}`}>View Profile</Link>
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Header with Date Selector */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Attendance Dashboard
                </h2>
                <p className="text-gray-600 mt-1">
                  Track attendance patterns and statistics
                </p>
              </div>
              <DateSelector />
            </div>
          </div>

          {/* Dashboard Content */}
          <Suspense fallback={<DashboardSkeleton />}>
            <DashboardContent
              employeeId={id}
              employeeName={employee.name}
              month={parsedMonth}
              year={parsedYear}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

async function DashboardContent({
  employeeId,
  employeeName,
  month,
  year,
}: {
  employeeId: string;
  employeeName: string;
  month?: number;
  year?: number;
}) {
  try {
    // Get both dashboard stats and full attendance history
    const [rawStats, attendanceHistory] = await Promise.all([
      getDashboardStats(employeeId, month, year),
      getAttendanceHistory({ id: employeeId }, month, year),
    ]);

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
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Attendance Overview
          </h2>
          <div className="grid">
            <DashboardStats stats={stats} />
          </div>
        </div>

        {/* Full Attendance History Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-[#4285f4] text-white py-3 px-6 font-medium flex justify-between items-center">
            <span>Complete Attendance History</span>
            <PDFExport
              records={attendanceHistory}
              employeeName={employeeName}
              month={month}
              year={year}
            />
          </div>
          <Suspense fallback={<HistoryTableSkeleton />}>
            <HistoryTable records={attendanceHistory} />
          </Suspense>
        </div>
      </>
    );
  } catch (error) {
    console.error("Error loading dashboard data:", error);
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="text-center py-8">
          <p className="text-red-600 font-medium">
            Error loading dashboard data
          </p>
          <p className="text-gray-500 mt-2">Please try again later</p>
        </div>
      </div>
    );
  }
}
