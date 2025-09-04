import { format } from "date-fns";
import { CalendarX, CheckCircle, Clock, XCircle, Calendar } from "lucide-react";
import { Badge } from "../ui/badge";
import { formatIndianTime } from "@/lib/utils/date-format";

interface HistoryTableProps {
  records: any[];
}

export function HistoryTable({ records }: HistoryTableProps) {
  if (!records || records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <CalendarX className="h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-700">
          No attendance records found
        </h3>
        <p className="text-gray-500 mt-2">
          Try selecting a different month or year
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-white rounded-b-lg overflow-hidden shadow-lg">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="py-4 px-6 font-semibold text-slate-700">Date</th>
            <th className="py-4 px-6 font-semibold text-slate-700">Check In</th>
            <th className="py-4 px-6 font-semibold text-slate-700">Check Out</th>
            <th className="py-4 px-6 font-semibold text-slate-700">Status</th>
            <th className="py-4 px-6 font-semibold text-slate-700">Late Minute</th>
            <th className="py-4 px-6 font-semibold text-slate-700">Early</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, index) => {
            const attendance = record.attendance || null;

            // highlight rows
            let rowClass =
              "border-b border-gray-100 hover:bg-gray-50/50 transition-colors";
            if (record.type === "SUNDAY") {
              rowClass = "bg-blue-50 border-b border-gray-100";
            } else if (record.type === "HOLIDAY") {
              rowClass = "bg-purple-50 border-b border-gray-100";
            }

            return (
              <tr key={index} className={rowClass}>
                {/* Date */}
                <td className="text-center py-4 px-6 font-semibold text-slate-800">
                  {format(new Date(record.date), "MMM d, yyyy")}
                </td>

                {/* Check In */}
                <td className="text-center py-4 px-6 text-slate-700 font-medium">
                  {attendance?.checkIn
                    ? formatIndianTime(attendance.checkIn)
                    : "-"}
                </td>

                {/* Check Out */}
                <td className="text-center py-4 px-6 text-slate-700 font-medium">
                  {attendance?.checkOut
                    ? formatIndianTime(attendance.checkOut)
                    : "-"}
                </td>

                {/* Status */}
                <td className="flex items-center justify-center py-4 px-6">
                  {record.type === "SUNDAY" ? (
                    <Badge
                      variant="outline"
                      className="flex items-center px-2 py-1 bg-blue-100 text-blue-800 border-blue-200"
                    >
                      <Calendar className="h-3 w-3 mr-1" />
                      Sunday
                    </Badge>
                  ) : record.type === "HOLIDAY" ? (
                    <Badge
                      variant="outline"
                      className="flex items-center px-2 py-1 bg-purple-100 text-purple-800 border-purple-200"
                    >
                      <Calendar className="h-3 w-3 mr-1" />
                      {record.holidayName || "Holiday"}
                    </Badge>
                  ) : (
                    <StatusBadge status={attendance?.status || "ABSENT"} />
                  )}
                </td>

                {/* Late */}
                <td className="text-center py-4 px-6">
                  {attendance?.late > 0 ? (
                    <span className="text-red-600 font-semibold bg-red-50 px-2 py-1 rounded-full">
                      {attendance.late} min
                    </span>
                  ) : (
                    <span className="text-slate-600 font-medium">N/A</span>
                  )}
                </td>

                {/* Early */}
                <td className="text-center py-4 px-6">
                  {attendance?.early > 0 ? (
                    <span className="text-red-600 font-semibold bg-red-50 px-2 py-1 rounded-full">
                      {attendance.early} min
                    </span>
                  ) : (
                    <span className="text-slate-600 font-medium">N/A</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  let badgeClass = "";
  let icon = null;

  switch (status) {
    case "PRESENT":
      badgeClass = "bg-green-100 text-green-800 border-green-200";
      icon = <CheckCircle className="h-3 w-3 mr-1" />;
      break;
    case "LATE":
      badgeClass = "bg-amber-100 text-amber-800 border-amber-200";
      icon = <Clock className="h-3 w-3 mr-1" />;
      break;
    case "ABSENT":
      badgeClass = "bg-red-100 text-red-800 border-red-200";
      icon = <XCircle className="h-3 w-3 mr-1" />;
      break;
    case "ON_LEAVE":
      badgeClass = "bg-orange-100 text-orange-800 border-orange-200";
      icon = <CalendarX className="h-3 w-3 mr-1" />;
      break;
    default:
      badgeClass = "bg-gray-100 text-gray-800 border-gray-200";
  }

  return (
    <Badge
      variant="outline"
      className={`flex items-center px-2 py-1 ${badgeClass}`}
    >
      {icon}
      <span className="whitespace-nowrap text-xs font-medium">
        {status === "ON_LEAVE"
          ? "On Leave"
          : status.charAt(0) + status.slice(1).toLowerCase()}
      </span>
    </Badge>
  );
}
