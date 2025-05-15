import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTeacherLeaveStats } from "@/lib/action/admin-teacher-leave.action";
import { CheckCircle, Clock, XCircle, Calendar } from "lucide-react";

export async function AdminTeacherLeaveStats() {
  const stats = await getTeacherLeaveStats();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">
            Total Requests
          </CardTitle>
          <div className="bg-[#e6eef8] p-2 rounded-full">
            <Calendar className="h-4 w-4 text-[#4285f4]" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
          <p className="text-xs text-gray-500">
            All leave requests in the system
          </p>
        </CardContent>
      </Card>

      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">
            Pending
          </CardTitle>
          <div className="bg-amber-50 p-2 rounded-full">
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-600">
            {stats.pending}
          </div>
          <p className="text-xs text-gray-500">Awaiting your review</p>
        </CardContent>
      </Card>

      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">
            Approved
          </CardTitle>
          <div className="bg-green-50 p-2 rounded-full">
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {stats.approved}
          </div>
          <p className="text-xs text-gray-500">Approved leave requests</p>
        </CardContent>
      </Card>

      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">
            Rejected
          </CardTitle>
          <div className="bg-red-50 p-2 rounded-full">
            <XCircle className="h-4 w-4 text-red-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {stats.rejected}
          </div>
          <p className="text-xs text-gray-500">Rejected leave requests</p>
        </CardContent>
      </Card>
    </div>
  );
}
