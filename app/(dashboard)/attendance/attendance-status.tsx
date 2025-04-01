import { Card, CardContent } from "@/components/ui/card";
import { formatIndianTime } from "@/lib/utils/date-format";

interface IAttendanceStatusProps {
  data?: {
    checkIn?: string;
    checkOut?: string;
    status?: string;
  };
}

export default function AttendanceStatus({ data }: IAttendanceStatusProps) {
  const checkIn = formatIndianTime(data?.checkIn);
  const checkOut = formatIndianTime(data?.checkOut);
  const statusText = data?.status || "Pending";

  const statusClass =
    data?.status === "PRESENT"
      ? "text-green-600"
      : data?.status === "LATE"
      ? "text-yellow-600"
      : data?.status === "ABSENT"
      ? "text-red-600"
      : "text-gray-600";

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Today&apos;s Status</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span>Check-in Time:</span>
            <span className="font-medium">{checkIn}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Check-out Time:</span>
            <span className="font-medium">{checkOut}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Status:</span>
            <span className={`font-medium ${statusClass}`}>{statusText}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
