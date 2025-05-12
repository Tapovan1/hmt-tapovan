import { Suspense } from "react";
import { CheckCircle, Clock, CalendarDays, Calendar } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 p-4">
        <div className="p-6 flex flex-col items-center justify-center space-y-4 text-center bg-white rounded-xl shadow-sm border border-amber-200">
          <CalendarDays className="w-10 h-10 text-amber-600" />
          <h1 className="text-2xl font-semibold text-amber-800">
            On Approved Leave
          </h1>
          <p className="text-amber-700">
            You are on approved leave today and do not need to mark your
            attendance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex items-center gap-1 justify-center p-4 ">
        <Calendar className="h-7 w-7 text-slate-700" />
        <h1 className="text-2xl font-bold text-slate-800"> Attendance</h1>
      </div>

      <div className="container grid gap-6 md:grid-cols-2 mx-auto p-4">
        {hasMarkedAttendance ? (
          <>
            <div className="">
              <div className="bg-emerald-500 text-white py-3 px-4 rounded-t-lg font-medium w-full text-left">
                Check In/Out
              </div>
              <div className="p-8 flex flex-col items-center justify-center space-y-4 text-center bg-white rounded-xl shadow-sm border border-green-200 mt-4">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-xl font-semibold text-green-800">
                  Attendance Marked
                </h1>
                <p className="text-green-700">
                  You&#39;ve successfully recorded your attendance for today.
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <div className="space-y-4">
                <div className="bg-emerald-500 text-white py-3 px-4 rounded-t-lg font-medium">
                  Check In/Out
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                  <Suspense fallback={<AttendanceFormPlaceholder />}>
                    <AttendanceFormWrapper user={user} />
                  </Suspense>
                </div>
              </div>
            </div>
          </>
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
        <div className="flex items-center justify-center p-4 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-center space-x-3 text-amber-700">
            <Clock className="h-4 w-4" />
            <span className="text-sm">
              No work schedule found for your department
            </span>
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
      <div className="grid grid-cols-2 gap-3">
        <div className="h-12 bg-slate-200 rounded-md animate-pulse"></div>
        <div className="h-12 bg-slate-200 rounded-md animate-pulse"></div>
      </div>
    );
  }

  function AttendanceStatusPlaceholder() {
    return (
      <div className="space-y-4">
        <div className="h-12 bg-slate-200 rounded-t-lg animate-pulse"></div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="h-5 w-24 bg-slate-200 rounded animate-pulse"></div>
              <div className="h-5 w-16 bg-slate-200 rounded animate-pulse"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-5 w-24 bg-slate-200 rounded animate-pulse"></div>
              <div className="h-5 w-16 bg-slate-200 rounded animate-pulse"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-5 w-24 bg-slate-200 rounded animate-pulse"></div>
              <div className="h-5 w-16 bg-slate-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
