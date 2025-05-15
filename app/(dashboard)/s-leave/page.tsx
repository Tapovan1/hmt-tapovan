import { Suspense } from "react";
import { SecurityAbsenceTable } from "./security-absence-table";
import DateSelector from "@/components/month-year";
import { Users, Loader2 } from "lucide-react";

export default async function SecurityLeavePage({
  searchParams,
}: {
  searchParams: { month?: string; year?: string };
}) {
  const { month, year } = await searchParams;
  // Get current date if no search params
  const today = new Date();
  const currentMonth = month ? Number.parseInt(month) : today.getMonth() + 1;
  const currentYear = year ? Number.parseInt(year) : today.getFullYear();

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="bg-[#e6eef8] p-2 rounded-full">
            <Users className="h-6 w-6 text-[#4285f4]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Student Leave
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <DateSelector />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="bg-[#4285f4] text-white py-3 px-6 font-medium">
          Student Leave Records
        </div>
        <Suspense
          fallback={
            <div className="w-full py-16 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-[#4285f4]" />
                <p className="text-gray-500">Loading student data...</p>
              </div>
            </div>
          }
        >
          <SecurityAbsenceTable month={currentMonth} year={currentYear} />
        </Suspense>
      </div>
    </div>
  );
}
