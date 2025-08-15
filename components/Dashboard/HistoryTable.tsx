import { format } from "date-fns";
import { CalendarX, CheckCircle, Clock, XCircle } from "lucide-react";
import { Badge } from "../ui/badge";
import { formatIndianTime } from "@/lib/utils/date-format";

interface HistoryTableProps {
  records: any[];
}

export function HistoryTable({ records }: HistoryTableProps) {
  if (!records || records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="bg-gradient-to-br from-orange-100 via-white to-green-100 p-8 rounded-xl border-2 border-dashed border-orange-300">
          <CalendarX className="h-12 w-12 text-orange-500 mb-4 mx-auto" />
          <h3 className="text-lg font-semibold text-slate-700">
            No attendance records found
          </h3>
          <p className="text-slate-600 mt-2">
            Try selecting a different month or year
          </p>
          <p className="text-sm text-orange-600 mt-2 font-medium">
            🇮🇳 Happy Independence Day! 🇮🇳
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="bg-gradient-to-r from-orange-500 via-white to-green-600 p-1 rounded-t-lg">
        <div className="bg-white rounded-md p-3 text-center">
          <h3 className="text-md font-bold text-slate-800">
            🇮🇳 Attendance History - Celebrating Freedom & Responsibility 🇮🇳
          </h3>
        </div>
      </div>

      <table className="w-full bg-white rounded-b-lg overflow-hidden shadow-lg">
        <thead>
          <tr className="bg-gradient-to-r from-orange-50 via-white to-green-50 border-b-2 border-orange-200">
            <th className="py-4 px-6 font-semibold text-slate-700">Date</th>
            <th className="py-4 px-6 font-semibold text-slate-700">Check In</th>
            <th className="py-4 px-6 font-semibold text-slate-700">
              Check Out
            </th>
            <th className="py-4 px-6 font-semibold text-slate-700">Status</th>
            <th className="py-4 px-6 font-semibold text-slate-700">
              Late Minute
            </th>
            <th className="py-4 px-6 font-semibold text-slate-700">Early</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, index) => (
            <tr
              key={record.id}
              className={`border-b border-orange-100 hover:bg-gradient-to-r hover:from-orange-25 hover:via-white hover:to-green-25 transition-all duration-200 ${
                index % 2 === 0 ? "bg-slate-50/30" : "bg-white"
              }`}
            >
              <td className="text-center py-4 px-6 font-semibold text-slate-800">
                {format(new Date(record.date), "MMM d, yyyy")}
              </td>
              <td className="text-center py-4 px-6 text-slate-700 font-medium">
                {formatIndianTime(record.checkIn)}
              </td>
              <td className="text-center py-4 px-6 text-slate-700 font-medium">
                {formatIndianTime(record.checkOut)}
              </td>
              <td className="flex items-center justify-center py-4 px-6">
                <StatusBadge status={record.status} />
              </td>
              <td className="text-center py-4 px-6">
                {record.late > 0 ? (
                  <span className="text-red-600 font-semibold bg-red-50 px-2 py-1 rounded-full">
                    {record.late} min
                  </span>
                ) : (
                  <span className="text-slate-600 font-medium">N/A</span>
                )}
              </td>
              <td className="text-center py-4 px-6">
                {record.early > 0 ? (
                  <span className="text-red-600 font-semibold bg-red-50 px-2 py-1 rounded-full">
                    {record.early} min
                  </span>
                ) : (
                  <span className="text-slate-600 font-medium">N/A</span>
                )}
              </td>
            </tr>
          ))}
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
      badgeClass = "bg-green-100 text-green-800 border-green-300 shadow-sm";
      icon = <CheckCircle className="h-3 w-3 mr-1" />;
      break;
    case "LATE":
      badgeClass = "bg-orange-100 text-orange-800 border-orange-300 shadow-sm";
      icon = <Clock className="h-3 w-3 mr-1" />;
      break;
    case "ABSENT":
      badgeClass = "bg-red-100 text-red-800 border-red-300 shadow-sm";
      icon = <XCircle className="h-3 w-3 mr-1" />;
      break;
    case "ON_LEAVE":
      badgeClass = "bg-orange-100 text-orange-800 border-orange-300 shadow-sm";
      icon = <CalendarX className="h-3 w-3 mr-1" />;
      break;
    default:
      badgeClass = "bg-slate-100 text-slate-800 border-slate-300 shadow-sm";
  }

  return (
    <Badge
      variant="outline"
      className={`flex items-center px-3 py-1 font-semibold ${badgeClass}`}
    >
      {icon}
      <span className="whitespace-nowrap text-xs">
        {status === "ON_LEAVE"
          ? "On Leave"
          : status.charAt(0) + status.slice(1).toLowerCase()}
      </span>
    </Badge>
  );
}
