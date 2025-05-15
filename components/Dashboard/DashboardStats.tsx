import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock4,
  CalendarDays,
} from "lucide-react";

interface Stats {
  todayStatus?: "PRESENT" | "LATE" | "ABSENT" | "NOT_MARKED" | "ON_LEAVE";
  monthlyStats: {
    thisMonth: number;
    totalDays: number;
    presentDays: number;
    lateDays: number;
    leaveDays: number;
    totalMinuteLate: string;
  };
}

export default function DashboardStats({ stats }: { stats: Stats }) {
  const statCards = [
    {
      title: "Today's Status",
      value: stats?.todayStatus || "NOT_MARKED",
      icon: Clock,
      valueColor:
        stats?.todayStatus === "PRESENT"
          ? "text-green-600"
          : stats?.todayStatus === "LATE"
          ? "text-amber-500"
          : stats?.todayStatus === "ABSENT"
          ? "text-red-600"
          : stats?.todayStatus === "ON_LEAVE"
          ? "text-orange-600"
          : "text-gray-600",
      description: "",
      iconColor: "text-[#3b82f6]",
    },
    {
      title: "This Month",
      value: `${stats.monthlyStats.thisMonth}/${stats.monthlyStats.totalDays}`,
      description: "Days present",
      icon: Calendar,
      iconColor: "text-[#3b82f6]",
    },
    {
      title: "On Time",
      value: stats.monthlyStats.presentDays,
      description: "Days on time this month",
      icon: CheckCircle2,
      iconColor: "text-green-600",
    },
    {
      title: "Late Arrivals",
      value: stats.monthlyStats.lateDays,
      description: "Days late this month",
      icon: AlertTriangle,
      iconColor: "text-amber-500",
    },
    {
      title: "Leave Days",
      value: stats.monthlyStats.leaveDays,
      description: "Days on leave",
      icon: CalendarDays,
      iconColor: "text-orange-500",
    },
    {
      title: "Total Minutes Late",
      value: stats.monthlyStats.totalMinuteLate,
      description: "Total minutes late this month",
      icon: Clock4,
      valueColor: "text-red-500",
      iconColor: "text-red-500",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full ">
      {statCards.map((card, index) => (
        <Card key={index} className="border-gray-100 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              {card.title}
            </CardTitle>
            <card.icon className={`h-5 w-5 ${card.iconColor}`} />
          </CardHeader>
          <CardContent className="py-1 px-4">
            <div
              className={`text-2xl font-bold ml-2 ${
                card.valueColor || "text-gray-800"
              }`}
            >
              {card.value}
            </div>
            {card.description && (
              <p className="text-xs text-gray-500 mt-1 ml-2">
                {card.description}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
