import { getGlobalSchedules } from "@/lib/action/work-schedule";
import ScheduleSettingsForm from "./schedule-setting-form";
import { Settings } from "lucide-react";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ScheduleSettingsPage() {
  try {
    const schedules = await getGlobalSchedules();

    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-[#e6eef8] p-3 rounded-full">
            <Settings className="h-6 w-6 text-[#4285f4]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Work Schedule Settings
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-[#4285f4] text-white py-3 px-6 font-medium">
            Configure Department Schedules
          </div>
          <div className="p-2 md:p-5">
            <ScheduleSettingsForm initialSchedules={schedules || []} />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading schedules:", error);
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-[#e6eef8] p-3 rounded-full">
            <Settings className="h-6 w-6 text-[#4285f4]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Work Schedule Settings
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-[#4285f4] text-white py-3 px-6 font-medium">
            Configure Department Schedules
          </div>
          <div className="p-2 md:p-5">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-red-50 p-4 rounded-full mb-4">
                <Settings className="h-10 w-10 text-red-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-700">
                Error Loading Schedules
              </h3>
              <p className="text-gray-500 mt-2 max-w-md">
                There was a problem loading the schedule settings. Please try
                refreshing the page.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
