import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Calendar, CheckCircle2, AlertTriangle } from "lucide-react";

interface Stats {
  todayStatus?: "PRESENT" | "LATE" | "ABSENT" | "NOT_MARKED";
  monthlyStats: {
    thisMonth: number;
    totalDays: number;
    presentDays: number;
    lateDays: number;
    totalWorkHours: string;
  };
}

export default function DashboardStats({ stats }: { stats: Stats }) {
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Today&apos;s Status
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              stats?.todayStatus === "PRESENT"
                ? "text-green-600"
                : stats?.todayStatus === "LATE"
                ? "text-yellow-600"
                : stats?.todayStatus === "ABSENT"
                ? "text-red-600"
                : "text-muted-foreground"
            }`}
          >
            {stats?.todayStatus || "Not Marked"}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">This Month</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.monthlyStats.thisMonth}/{stats.monthlyStats.totalDays}
          </div>
          <p className="text-xs text-muted-foreground">Days present</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">On Time</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.monthlyStats.presentDays}
          </div>
          <p className="text-xs text-muted-foreground">
            Days on time this month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.monthlyStats.lateDays}
          </div>
          <p className="text-xs text-muted-foreground">Days late this month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Work Hours
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.monthlyStats.totalWorkHours}
          </div>
          <p className="text-xs text-muted-foreground">Hours this month</p>
        </CardContent>
      </Card>
    </>
  );
}
