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
          ? "text-green-700"
          : stats?.todayStatus === "LATE"
          ? "text-orange-600"
          : stats?.todayStatus === "ABSENT"
          ? "text-red-600"
          : stats?.todayStatus === "ON_LEAVE"
          ? "text-orange-500"
          : "text-slate-600",
      description: "",
      iconColor: "text-orange-600",
      cardBg: "bg-gradient-to-br from-orange-50 to-white border-orange-200",
    },
    {
      title: "This Month",
      value: `${stats.monthlyStats.thisMonth}/${stats.monthlyStats.totalDays}`,
      description: "Days present",
      icon: Calendar,
      iconColor: "text-green-700",
      cardBg: "bg-gradient-to-br from-green-50 to-white border-green-200",
    },
    {
      title: "On Time",
      value: stats.monthlyStats.presentDays,
      description: "Days on time this month",
      icon: CheckCircle2,
      iconColor: "text-green-700",
      cardBg: "bg-gradient-to-br from-green-50 to-white border-green-200",
    },
    {
      title: "Late Arrivals",
      value: stats.monthlyStats.lateDays,
      description: "Days late this month",
      icon: AlertTriangle,
      iconColor: "text-orange-600",
      cardBg: "bg-gradient-to-br from-orange-50 to-white border-orange-200",
    },
    {
      title: "Leave Days",
      value: stats.monthlyStats.leaveDays,
      description: "Days on leave",
      icon: CalendarDays,
      iconColor: "text-orange-500",
      cardBg: "bg-gradient-to-br from-orange-50 to-white border-orange-200",
    },
    {
      title: "Total Minutes Late",
      value: stats.monthlyStats.totalMinuteLate,
      description: "Total minutes late this month",
      icon: Clock4,
      valueColor: "text-red-600",
      iconColor: "text-red-600",
      cardBg: "bg-gradient-to-br from-red-50 to-white border-red-200",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full">
      {/* <CHANGE> Added Independence Day header */}
      <div className="col-span-full mb-4">
        <div className="bg-gradient-to-r from-orange-500 via-white to-green-600 p-1 rounded-lg">
          <div className="bg-white rounded-md p-4 text-center">
            <h2 className="text-lg font-bold text-slate-800">
              🇮🇳 Independence Day Dashboard - August 15th 🇮🇳
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Celebrating 79 years of freedom with dedication to work
            </p>
          </div>
        </div>
      </div>

      {statCards.map((card, index) => (
        <Card
          key={index}
          className={`${card.cardBg} shadow-md overflow-hidden hover:shadow-lg transition-all duration-300`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">
              {card.title}
            </CardTitle>
            <div className="p-2 rounded-full bg-white/50">
              <card.icon className={`h-5 w-5 ${card.iconColor}`} />
            </div>
          </CardHeader>
          <CardContent className="py-1 px-4">
            <div
              className={`text-2xl font-bold ml-2 ${
                card.valueColor || "text-slate-800"
              }`}
            >
              {card.value}
            </div>
            {card.description && (
              <p className="text-xs text-slate-600 mt-1 ml-2 font-medium">
                {card.description}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
