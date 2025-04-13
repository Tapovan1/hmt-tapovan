import { getGlobalSchedules } from "../../../lib/action/work-schedule";
import ScheduleSettingsForm from "./schedule-setting-form";

export default async function ScheduleSettingsPage() {
  try {
    const schedules = await getGlobalSchedules();

    return (
      <div className="p-5 space-y-6">
        <h1 className="text-3xl font-bold">Work Schedule Settings</h1>
        <ScheduleSettingsForm initialSchedules={schedules || []} />
      </div>
    );
  } catch (error) {
    console.error("Error loading schedules:", error);
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">Work Schedule Settings</h1>
        <ScheduleSettingsForm departments={[]} />
      </div>
    );
  }
}
