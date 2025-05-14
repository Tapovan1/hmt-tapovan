import { Suspense } from "react";
import { getAttendanceHistory } from "@/lib/action/history.action";
import { HistoryTable } from "@/components/Dashboard/HistoryTable";
import { HistoryTableSkeleton } from "@/components/Dashboard/HistoryTableSkeleton";
import DateSelector from "@/components/month-year";
import { getUser } from "@/lib/action/getUser";
import { CalendarClock } from "lucide-react";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: number; year?: number }>;
}) {
  // Handle filtering directly on the server
  const { month, year } = await searchParams;
  const user = await getUser();

  // Pass the filter parameters to the data fetching function
  const data = await getAttendanceHistory(user, month, year);

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-[#eef5ff] p-3 rounded-full">
            <CalendarClock className="h-6 w-6 text-[#4285f4]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Attendance History
          </h1>
        </div>
        <DateSelector />
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="bg-[#4285f4] text-white py-3 px-6 font-medium">
          Monthly Attendance Records
        </div>
        <Suspense fallback={<HistoryTableSkeleton />}>
          <HistoryTable records={data} />
        </Suspense>
      </div>
    </div>
  );
}
