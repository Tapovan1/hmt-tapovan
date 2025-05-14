import { Suspense } from "react";
import { CheckCircle, Clock, CalendarDays, CalendarClock } from "lucide-react";
import { getAttendance } from "@/lib/action/attendance.action";
import { verifySession } from "@/lib/session";
import { getUser } from "@/lib/action/getUser";
import { getSchedulesByDepartment } from "@/lib/action/work-schedule";
import AttendanceStatus from "./attendance-status";
import AttendanceForm from "./attendance-form";

export const experimental_ppr = true;

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

export default async function AttendancePage() {
  const user = await getUser();
  const session = await verifySession();
  const attendance = await getAttendance({
    id: typeof session?.userId === "string" ? session.userId : "",
  });

  if (!user) {
    return null;
  }

  const isOnLeave = attendance?.status === "ON_LEAVE";
  const hasMarkedAttendance =
    (attendance?.checkOut && !isOnLeave) || attendance?.status === "ABSENT";

  if (isOnLeave) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <div className="max-w-md w-full p-8 flex flex-col items-center justify-center space-y-6 text-center bg-white rounded-xl shadow-sm border border-orange-200">
          <div className="bg-orange-50 p-4 rounded-full">
            <CalendarDays className="w-12 h-12 text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              On Approved Leave
            </h1>
            <p className="text-gray-600">
              You are on approved leave today and do not need to mark your
              attendance.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="bg-[#e6eef8] p-3 rounded-full">
          <CalendarClock className="h-6 w-6 text-[#4285f4]" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 ">
          Attendance
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {hasMarkedAttendance ? (
          <div>
            <div className="bg-[#4285f4] text-white py-3 px-6 rounded-t-xl font-medium">
              Check In/Out
            </div>
            <div className="p-8 flex flex-col items-center justify-center space-y-6 text-center bg-white rounded-b-xl shadow-sm border border-gray-100">
              <div className="bg-green-50 p-4 rounded-full">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  Attendance Marked
                </h2>
                <p className="text-gray-600">
                  You&#39;ve successfully recorded your attendance for today.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="bg-[#4285f4] text-white py-3 px-6 rounded-t-xl font-medium">
              Check In/Out
            </div>
            <div className="bg-white rounded-b-xl p-6 shadow-sm border border-gray-100">
              <Suspense fallback={<AttendanceFormPlaceholder />}>
                <AttendanceFormWrapper user={user} />
              </Suspense>
            </div>
          </div>
        )}

        <Suspense fallback={<AttendanceStatusPlaceholder />}>
          <AttendanceStatusWrapper />
        </Suspense>
      </div>
    </div>
  );

  async function AttendanceFormWrapper({ user }: { user: User }) {
    const workSchedule = await getSchedulesByDepartment(user.department);
    if (!workSchedule) {
      return (
        <div className="flex items-center justify-center p-6 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-center space-x-3 text-amber-700">
            <Clock className="h-5 w-5" />
            <span>No work schedule found for your department</span>
          </div>
        </div>
      );
    }
    const session = await verifySession();
    const attendance = await getAttendance({
      id: typeof session?.userId === "string" ? session.userId : "",
    });

    return (
      <AttendanceForm
        // @ts-expect-error: initialWorkSchedule prop type mismatch with AttendanceForm, but required for passing schedule data
        initialWorkSchedule={workSchedule}
        hasCheckedIn={!!attendance?.checkIn}
        hasCheckedOut={!!attendance?.checkOut}
      />
    );
  }

  async function AttendanceStatusWrapper() {
    const session = await verifySession();
    const data = await getAttendance({
      id: typeof session?.userId === "string" ? session.userId : "",
    });

    return (
      <AttendanceStatus
        data={
          data || { checkIn: undefined, checkOut: undefined, status: undefined }
        }
      />
    );
  }

  function AttendanceFormPlaceholder() {
    return (
      <div className="space-y-6">
        <div className="h-6 w-48 bg-gray-200 rounded-md animate-pulse"></div>
        <div className="h-40 bg-gray-100 rounded-lg animate-pulse"></div>
        <div className="space-y-3">
          <div className="h-5 w-full bg-gray-200 rounded-md animate-pulse"></div>
          <div className="h-5 w-3/4 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-12 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="h-12 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
      </div>
    );
  }

  function AttendanceStatusPlaceholder() {
    return (
      <div className="space-y-0">
        <div className="h-12 bg-gray-200 rounded-t-xl animate-pulse"></div>
        <div className="bg-white rounded-b-xl p-6 shadow-sm border border-gray-100">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
