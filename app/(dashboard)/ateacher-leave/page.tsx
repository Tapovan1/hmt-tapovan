import { Suspense } from "react";

import { AdminTeacherLeaveStats } from "./admin-teacher-leave-stats";
import { AdminTeacherLeaveTable } from "./admin-teacher-leave-table";

import { getFilteredTeacherLeaves } from "@/lib/action/admin-teacher-leave.action";
import LoadingBox from "@/components/LoadingBox";

export default async function AdminTeacherLeavePage() {
  // Check if the user is an admin
  const rawLeaves = await getFilteredTeacherLeaves({});
  const leaves = rawLeaves.map((leave) => ({
    ...leave,
    totalDays: leave.totalDays ?? undefined,
  }));
  // If not an admin, redirect to the home page

  return (
    <div className="container px-4 py-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Teacher Leave Management
          </h1>
          <p className="text-muted-foreground">
            Review, approve, or reject teacher leave requests from this
            dashboard.
          </p>
        </div>

        <Suspense
          fallback={
            <div>
              <LoadingBox />
            </div>
          }
        >
          <AdminTeacherLeaveStats />
        </Suspense>

        <div className="rounded-lg border bg-card">
          <div className="p-6 flex flex-col gap-6">
            <h2 className="text-xl font-semibold">Leave Requests</h2>

            <Suspense
              fallback={
                <div>
                  <LoadingBox />
                </div>
              }
            >
              {/* <AdminTeacherLeaveFilters /> */}
            </Suspense>

            <Suspense
              fallback={
                <div>
                  <LoadingBox />
                </div>
              }
            >
              <AdminTeacherLeaveTable leaves={leaves} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
