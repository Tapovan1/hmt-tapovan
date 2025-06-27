import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock4,
  CalendarDays,
  User,
} from "lucide-react";
import Link from "next/link";

// Mock data - replace with your actual API call
async function getEmployeeData(id: string) {
  // Replace with your actual API call
  return {
    id: id,
    name: "John Doe",
    department: "Computer Operator",
    avatar: "/placeholder.svg?height=100&width=100",
    stats: {
      todayStatus: "PRESENT" as const,
      monthlyStats: {
        thisMonth: 22,
        totalDays: 25,
        presentDays: 20,
        lateDays: 2,
        leaveDays: 3,
        totalMinuteLate: "45 min",
      },
    },
  };
}

export default async function EmployeeMonitorPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const employee = await getEmployeeData(id);

  const statCards = [
    {
      title: "Today's Status",
      value: employee.stats.todayStatus,
      icon: Clock,
      valueColor:
        employee.stats.todayStatus === "PRESENT"
          ? "text-green-600"
          : employee.stats.todayStatus === "LATE"
          ? "text-amber-500"
          : employee.stats.todayStatus === "ABSENT"
          ? "text-red-600"
          : employee.stats.todayStatus === "ON_LEAVE"
          ? "text-orange-600"
          : "text-gray-600",
      iconColor: "text-[#3b82f6]",
    },
    {
      title: "This Month",
      value: `${employee.stats.monthlyStats.thisMonth}/${employee.stats.monthlyStats.totalDays}`,
      description: "Days present",
      icon: Calendar,
      iconColor: "text-[#3b82f6]",
    },
    {
      title: "On Time",
      value: employee.stats.monthlyStats.presentDays,
      description: "Days on time this month",
      icon: CheckCircle2,
      iconColor: "text-green-600",
    },
    {
      title: "Late Arrivals",
      value: employee.stats.monthlyStats.lateDays,
      description: "Days late this month",
      icon: AlertTriangle,
      iconColor: "text-amber-500",
    },
    {
      title: "Leave Days",
      value: employee.stats.monthlyStats.leaveDays,
      description: "Days on leave",
      icon: CalendarDays,
      iconColor: "text-orange-500",
    },
    {
      title: "Total Minutes Late",
      value: employee.stats.monthlyStats.totalMinuteLate,
      description: "Total minutes late this month",
      icon: Clock4,
      valueColor: "text-red-500",
      iconColor: "text-red-500",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link href="/employee-history">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-[#e6eef8] p-3 rounded-full">
              <User className="h-6 w-6 text-[#4285f4]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                {employee.name}
              </h1>
              <p className="text-gray-600">{employee.department}</p>
            </div>
          </div>
        </div>
        <Avatar className="h-16 w-16 border-2 border-[#4285f4]">
          <AvatarImage
            src={employee.avatar || "/placeholder.svg"}
            alt={employee.name}
          />
          <AvatarFallback className="bg-[#4285f4] text-white font-semibold text-lg">
            {employee.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Monthly Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full">
        {statCards.map((card, index) => (
          <Card
            key={index}
            className="border-gray-100 shadow-sm overflow-hidden"
          >
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
    </div>
  );
}
