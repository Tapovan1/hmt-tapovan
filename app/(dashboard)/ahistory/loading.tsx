import { Loader2, CalendarClock } from "lucide-react";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-[#e6eef8] p-3 rounded-full">
            <CalendarClock className="h-6 w-6 text-[#4285f4] opacity-50" />
          </div>
          <div className="h-8 w-56 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-10 w-40 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="bg-[#4285f4] text-white py-3 px-6 font-medium flex items-center">
          <div className="h-5 w-5 mr-2 bg-white/20 rounded animate-pulse" />
          <span>Staff Attendance Records</span>
          <div className="ml-auto h-4 w-32 bg-white/20 rounded animate-pulse" />
        </div>

        {/* Loading Content */}
        <div className="min-h-[500px] flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Loader2 className="h-14 w-14 animate-spin text-[#4285f4]" />
              <div className="absolute inset-0 h-14 w-14 rounded-full border-4 border-blue-100 animate-pulse" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold text-gray-800">Loading attendance records...</p>
              <p className="text-sm text-gray-500">Please wait while we fetch the latest data</p>
            </div>
            
            {/* Skeleton Rows */}
            <div className="w-full max-w-4xl mt-8 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg animate-pulse">
                  <div className="h-10 w-10 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                  </div>
                  <div className="h-8 w-24 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
