import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatIndianTime } from "@/lib/utils/date-format";
import { format, parseISO } from "date-fns";
import { CheckCircle, Clock, XCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function RecentAttendance({
  recentAttendance,
}: {
  recentAttendance: {
    date: string;
    checkIn?: string;
    status: "PRESENT" | "LATE" | "ABSENT" | "ON_LEAVE";
  }[];
}) {
  return (
    <Card className="border-gray-100 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-800">
          Recent Attendance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentAttendance.map((record, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div>
                <div className="font-medium text-gray-800">
                  {format(parseISO(record.date), "EEE, MMM d, yyyy")}
                </div>
                <div className="text-sm text-gray-500 flex items-center mt-1">
                  <Clock className="h-3.5 w-3.5 mr-1 text-gray-400" />
                  {record.checkIn
                    ? formatIndianTime(record.checkIn)
                    : "Not marked"}
                </div>
              </div>
              <StatusBadge status={record.status} />
            </div>
          ))}

          {recentAttendance.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              No recent attendance records found
            </div>
          )}

          {recentAttendance.length > 0 && (
            <Link
              href="/history"
              className="flex items-center justify-center text-[#3b82f6] hover:text-[#2563eb] font-medium text-sm mt-2"
            >
              View all history
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({
  status,
}: {
  status: "PRESENT" | "LATE" | "ABSENT" | "ON_LEAVE";
}) {
  if (status === "PRESENT") {
    return (
      <div className="flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
        <CheckCircle className="h-3.5 w-3.5 mr-1" />
        Present
      </div>
    );
  }

  if (status === "LATE") {
    return (
      <div className="flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium">
        <Clock className="h-3.5 w-3.5 mr-1" />
        Late
      </div>
    );
  }

  if (status === "ON_LEAVE") {
    return (
      <div className="flex items-center px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-medium">
        <Clock className="h-3.5 w-3.5 mr-1" />
        On Leave
      </div>
    );
  }

  return (
    <div className="flex items-center px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium">
      <XCircle className="h-3.5 w-3.5 mr-1" />
      Absent
    </div>
  );
}
