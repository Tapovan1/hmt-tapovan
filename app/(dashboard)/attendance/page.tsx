import { Suspense } from "react";
import { CheckCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getAttendance } from "@/lib/action/attendance.action";

import AttendanceForm from "./attendance-form";
import AttendanceStatus from "./attendance-status";
import WorkScheduleDisplay from "./work-schedule-display";
import { verifySession } from "@/lib/session";
import { getUser } from "@/lib/action/getUser";
import { getSchedulesByDepartment } from "@/lib/action/work-schedule";

import { CalendarDays } from "lucide-react";

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
  const hasMarkedAttendance = attendance && !isOnLeave;

  if (isOnLeave) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50 px-4">
        <div className="p-6 flex flex-col items-center justify-center space-y-4 text-center bg-amber-50 rounded-xl shadow-sm border border-amber-200">
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

  if (hasMarkedAttendance) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50 px-4">
        <div className="p-6 flex flex-col items-center justify-center space-y-4 text-center bg-green-50 rounded-xl shadow-sm border border-green-200">
          <CheckCircle className="w-10 h-10 text-green-600" />
          <h1 className="text-2xl font-semibold text-green-800">
            Attendance Already Marked
          </h1>
          <p className="text-green-700">
            You’ve already marked your attendance for today. No further action
            is needed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Mark Attendance</h1>
        <Suspense fallback={<WorkSchedulePlaceholder />}>
          {user && <WorkScheduleDisplay user={user} />}
        </Suspense>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Suspense fallback={<AttendanceFormPlaceholder />}>
          {user && <AttendanceFormWrapper user={user} />}
        </Suspense>
        <Suspense fallback={<AttendanceStatusPlaceholder />}>
          <AttendanceStatusWrapper />
        </Suspense>
      </div>
    </div>
  );
  async function AttendanceFormWrapper({ user }: { user: User }) {
    const workSchedule = await getSchedulesByDepartment(user.department);
    const session = await verifySession();
    const attendance = await getAttendance({
      id: typeof session?.userId === "string" ? session.userId : "",
    });

    return (
      <AttendanceForm
        // @ts-expect-error: WorkSchedule type may not match the expected type
        initialWorkSchedule={
          workSchedule || {
            name: "Default Schedule",
            department: user.department,
            startTime: "",
            endTime: "",
            workDays: [],
            graceMinutes: 0,
            saturdayStartTime: "",
            saturdayEndTime: "",
            saturdayGraceMinutes: 0,
          }
        }
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

  function WorkSchedulePlaceholder() {
    return (
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>Loading work schedule...</span>
      </div>
    );
  }

  function AttendanceFormPlaceholder() {
    return <div className="h-64 bg-muted rounded-lg animate-pulse"></div>;
  }

  function AttendanceStatusPlaceholder() {
    return (
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Today&apos;s Status</h2>
          <div className="space-y-4">
            <div className="h-6 bg-muted rounded animate-pulse"></div>
            <div className="h-6 bg-muted rounded animate-pulse"></div>
            <div className="h-6 bg-muted rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
}
