import { formatIndianTime } from "@/lib/utils/date-format";
import {
  Clock,
  ClockIcon as ClockCheck,
  CalendarCheck,
  AlertTriangle,
} from "lucide-react";

interface IAttendanceStatusProps {
  data?: {
    checkIn?: string;
    checkOut?: string;
    status?: string;
    late?: number;
    early?: number;
    overTime?: number;
  };
}

export default function AttendanceStatus({ data }: IAttendanceStatusProps) {
  const checkIn = formatIndianTime(data?.checkIn) || "N/A";
  const checkOut = formatIndianTime(data?.checkOut) || "N/A";
  const statusText = data?.status || "Pending";

  const getStatusInfo = () => {
    switch (data?.status) {
      case "PRESENT":
        return {
          color: "text-green-600",
          bgColor: "bg-green-50",
          icon: <CalendarCheck className="h-5 w-5" />,
        };
      case "LATE":
        return {
          color: "text-amber-600",
          bgColor: "bg-amber-50",
          icon: <Clock className="h-5 w-5" />,
        };
      case "ABSENT":
        return {
          color: "text-red-600",
          bgColor: "bg-red-50",
          icon: <AlertTriangle className="h-5 w-5" />,
        };
      default:
        return {
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          icon: <ClockCheck className="h-5 w-5" />,
        };
    }
  };

  const { color, bgColor, icon } = getStatusInfo();

  return (
    <div className="space-y-0">
      <div className="bg-[#4285f4] text-white py-3 px-6 rounded-t-xl font-medium">
        Today&#39;s Status
      </div>

      <div className="bg-white rounded-b-xl p-6 shadow-sm border border-gray-100">
        <div className="space-y-6">
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600 font-medium flex items-center gap-2">
              <ClockCheck className="h-4 w-4 text-[#4285f4]" /> Check-in Time:
            </span>
            <span className="font-semibold text-gray-800">{checkIn}</span>
          </div>

          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600 font-medium flex items-center gap-2">
              <ClockCheck className="h-4 w-4 text-[#4285f4]" /> Check-out Time:
            </span>
            <span className="font-semibold text-gray-800">{checkOut}</span>
          </div>

          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600 font-medium flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-[#4285f4]" /> Status:
            </span>
            <span
              className={`font-semibold ${color} flex items-center gap-1 ${bgColor} px-3 py-1 rounded-full`}
            >
              {icon}
              {statusText}
            </span>
          </div>

          {data?.status === "LATE" && (
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#4285f4]" /> Late Minutes:
              </span>
              <span className="font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                {data?.late} minutes
              </span>
            </div>
          )}
          {data?.early && (
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#4285f4]" /> Early Exit:
              </span>
              <span className="font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {data?.early} minutes
              </span>
            </div>
          )}
          {data?.overTime && (
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#4285f4]" /> Overtime:
              </span>
              <span className="font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                {data?.overTime} minutes
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
