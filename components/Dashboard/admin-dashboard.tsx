import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Clock,
  UserX,
  CalendarCheck,
  Activity,
  ArrowRight,
} from "lucide-react";
import { getAdminDashboardStats } from "@/lib/action/dashboard.action";
import { formatIndianTime } from "@/lib/utils/date-format";
import LeaveRequestAction from "./LeaveRequestAction";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export async function AdminDashboard() {
  const data = await getAdminDashboardStats();

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div className="flex items-center">
            <div className="p-3 rounded-full mr-4">
              <Users className="h-6 w-6 text-[#4285f4]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-2xl font-bold text-gray-800">
                Admin Dashboard
              </h1>
              <p className="text-gray-500 mt-1">
                Manage attendance and leave requests
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button
              className="bg-[#4285f4] hover:bg-[#3b78e7] text-white"
              asChild
            >
              <Link href="/employee">
                <Users className="mr-2 h-4 w-4" />
                Manage Employees
              </Link>
            </Button>
            <Button variant="outline" className="border-gray-200" asChild>
              <Link href="/report">
                <Activity className="mr-2 h-4 w-4" />
                View Reports
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-gray-100 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Total Employees
            </CardTitle>
            <div className="bg-[#e6eef8] p-2 rounded-lg">
              <Users className="h-5 w-5 text-[#4285f4]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">
              {data.totalEmployees}
            </div>
            <p className="text-xs text-gray-500 mt-1">Active staff members</p>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Today's Attendance
            </CardTitle>
            <div className="bg-green-50 p-2 rounded-lg">
              <CalendarCheck className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">
              {data.todayStats.present +
                data.todayStats.absent +
                data.todayStats.late}
            </div>
            <div className="flex items-center mt-1">
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100 mr-2">
                {data.todayStats.present} Present
              </Badge>
              <p className="text-xs text-gray-500">Total marked</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Late Arrivals
            </CardTitle>
            <div className="bg-amber-50 p-2 rounded-lg">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">
              {data.todayStats.late}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Employees arrived late today
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Absent Employees
            </CardTitle>
            <div className="bg-red-50 p-2 rounded-lg">
              <UserX className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">
              {data.todayStats.absent}
            </div>
            <p className="text-xs text-gray-500 mt-1">Employees absent today</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Leave Requests */}
        <LeaveRequestAction />

        {/* Recent Activities */}
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className=" border-b border-gray-100">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold text-gray-800">
                Recent Attendance
              </CardTitle>
              <Link
                href="/ahistory"
                className="text-[#4285f4] hover:text-[#3b78e7] text-sm font-medium flex items-center"
              >
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="">
            {data?.recentActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Activity className="h-12 w-12 text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-700">
                  No recent activities
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  Activities will appear here as they happen
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {data?.recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-4 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className={`p-2 rounded-full flex-shrink-0 ${
                        activity.status === "PRESENT"
                          ? "bg-green-50"
                          : activity.status === "LATE"
                          ? "bg-amber-50"
                          : "bg-red-50"
                      }`}
                    >
                      {activity.status === "PRESENT" ? (
                        <CalendarCheck className="h-5 w-5 text-green-600" />
                      ) : activity.status === "LATE" ? (
                        <Clock className="h-5 w-5 text-amber-600" />
                      ) : (
                        <UserX className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium text-gray-800">
                          {activity.user.name}
                        </p>
                        <span className="text-sm text-gray-500">
                          {formatIndianTime(activity.checkIn?.toISOString())}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Marked attendance
                        <Badge
                          className={`ml-2 ${
                            activity.status === "PRESENT"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : activity.status === "LATE"
                              ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                              : "bg-red-100 text-red-800 hover:bg-red-100"
                          }`}
                        >
                          {activity.status}
                        </Badge>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
