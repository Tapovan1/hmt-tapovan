import { Suspense } from "react";
import { CalendarDays, Plus } from "lucide-react";
import { HolidayStats } from "./components/holiday-stats";
import { HolidayTable } from "./components/holiday-table";
import { HolidayDialog } from "./components/holiday-dialog";
import { HolidayFilter } from "./components/holiday-filter";
import { Button } from "@/components/ui/button";
import DateSelector from "@/components/month-year";

export default async function HolidaysPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string; type?: string }>;
}) {
  const params = await searchParams;
  const month = params.month ? Number.parseInt(params.month) : undefined;
  const year = params.year
    ? Number.parseInt(params.year)
    : new Date().getFullYear();
  const type = params.type || "all";

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-[#e6eef8] p-3 rounded-full">
          <CalendarDays className="h-6 w-6 text-[#4285f4]" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Holiday Management
        </h1>
      </div>

      <p className="text-gray-600 mb-6">
        Manage school holidays to prevent unnecessary attendance marking and
        absent notifications.
      </p>

      {/* Holiday Statistics */}
      <Suspense
        fallback={
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6 mb-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-[100px] animate-pulse"
              >
                <div className="h-4 w-16 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 w-8 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 w-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        }
      >
        <HolidayStats />
      </Suspense>

      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <DateSelector />
        </div>
        <HolidayDialog>
          <Button className="bg-[#4285f4] hover:bg-[#3b78e7] text-white">
            <Plus className="mr-2 h-4 w-4" />
            Add Holiday
          </Button>
        </HolidayDialog>
      </div>

      {/* Holiday Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-[#4285f4] text-white py-3 px-6 font-medium flex items-center">
          <CalendarDays className="h-5 w-5 mr-2" />
          <span>Holiday Calendar</span>
        </div>
        <Suspense
          fallback={
            <div className="p-6">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-16 bg-gray-100 rounded-md animate-pulse"
                  ></div>
                ))}
              </div>
            </div>
          }
        >
          <HolidayTable month={month} year={year} type={type} />
        </Suspense>
      </div>
    </div>
  );
}
