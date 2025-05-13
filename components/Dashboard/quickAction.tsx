import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Clock, History, CalendarPlus } from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      title: "Mark Attendance",
      href: "/attendance",
      icon: Clock,
      variant: "default",
      color: "bg-[#3b82f6] hover:bg-[#2563eb]",
    },
    {
      title: "View History",
      href: "/history",
      icon: History,
      variant: "outline" as const,
      color: "border-gray-200 hover:bg-gray-50",
    },
    {
      title: "Request Leave",
      href: "/leave/request",
      icon: CalendarPlus,
      variant: "outline" as const,
      color: "border-gray-200 hover:bg-gray-50",
    },
  ];

  return (
    <Card className="border-gray-100 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              className={`w-full h-11 ${action.color}`}
              variant={action.variant}
              asChild
            >
              <Link
                href={action.href}
                className="flex items-center justify-center"
              >
                <action.icon className="mr-2 h-5 w-5" />
                {action.title}
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
