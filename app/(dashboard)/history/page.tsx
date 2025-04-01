import { Suspense } from "react";
import { getAttendanceHistory } from "@/lib/action/history.action";
import { HistoryTable } from "@/components/Dashboard/HistoryTable";
import { HistoryTableSkeleton } from "@/components/Dashboard/HistoryTableSkeleton";
import { Card } from "@/components/ui/card";
import DateSelector from "@/components/month-year";
import { getUser } from "@/lib/action/getUser";

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
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Attendance History</h1>
      <DateSelector />
      <Card>
        <div className="p-6">
          <Suspense fallback={<HistoryTableSkeleton />}>
            <HistoryTable records={data} />
          </Suspense>
        </div>
      </Card>
    </div>
  );
}
