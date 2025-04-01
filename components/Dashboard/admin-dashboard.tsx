import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, AlertCircle, UserX } from "lucide-react";
// import { AttendanceChart } from "@/components/dashboard/attendance-chart";
import { getAdminDashboardStats } from "@/lib/action/dashboard.action";
import { format } from "date-fns";
import QuickActions from "./quickAction";

export async function AdminDashboard({
  searchParams = {},
}: {
  searchParams?: { month?: number; year?: number };
}) {
  const { month: monthParam, year: yearParam } = await searchParams;
  const parsedMonth = monthParam;
  const parsedYear = yearParam;
  const data = await getAdminDashboardStats(parsedMonth, parsedYear);
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Employees
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">+2 since last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Today&apos;s Attendance
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.todayStats.present + data.todayStats.absent}
            </div>
            <p className="text-xs text-muted-foreground">
              79.6% of total employees
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.todayStats.late}</div>
            <p className="text-xs text-muted-foreground">
              9.7% of present employees
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Absent Employees
            </CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.todayStats.absent}</div>
            <p className="text-xs text-muted-foreground">
              20.3% of total employees
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* <AttendanceChart /> */}
        <QuickActions />

        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(activity.date), "hh:mm a")}
                  </div>
                  <div className="text-sm">
                    {activity.user.name} marked attendance{" "}
                    <span>{activity.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
