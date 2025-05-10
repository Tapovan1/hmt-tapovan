import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatIndianTime } from "@/lib/utils/date-format";

interface IAttendanceStatusProps {
  data?: {
    checkIn?: string;
    checkOut?: string;
    status?: string;
  };
}

export default function AttendanceStatus({ data }: IAttendanceStatusProps) {
  const checkIn = formatIndianTime(data?.checkIn) || "N/A";
  const checkOut = formatIndianTime(data?.checkOut) || "N/A";
  const statusText = data?.status || "Pending";

  const getStatusColor = () => {
    switch (data?.status) {
      case "PRESENT":
        return "text-green-600";
      case "LATE":
        return "text-yellow-600";
      case "ABSENT":
        return "text-red-600";
      default:
        return "text-slate-600";
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-emerald-500 text-white py-3 px-4 rounded-t-lg font-medium">
        Today's Status
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-slate-600 font-medium">Check-in Time:</span>
            <span className="font-semibold text-slate-800">{checkIn}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-600 font-medium">Check-out Time:</span>
            <span className="font-semibold text-slate-800">{checkOut}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-600 font-medium">Status:</span>
            <span className={`font-semibold ${getStatusColor()}`}>
              {statusText}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
