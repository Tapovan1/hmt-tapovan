import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getHolidayStats } from "@/lib/action/holiday.action"
import { CalendarDays, Flag, Church, GraduationCap, MapPin, Calendar } from "lucide-react"

export async function HolidayStats() {
  const stats = await getHolidayStats()

  const statCards = [
    {
      title: "Total Holidays",
      value: stats.total,
      icon: CalendarDays,
      color: "text-[#4285f4]",
      bgColor: "bg-[#e6eef8]",
    },
    {
      title: "National",
      value: stats.national,
      icon: Flag,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Religious",
      value: stats.religious,
      icon: Church,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "School",
      value: stats.school,
      icon: GraduationCap,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Local",
      value: stats.local,
      icon: MapPin,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "This Month",
      value: stats.thisMonth,
      icon: Calendar,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6 mb-6">
      {statCards.map((card, index) => (
        <Card key={index} className="border-gray-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">{card.title}</CardTitle>
            <div className={`p-2 rounded-full ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
