import { Suspense } from "react";

import { AdminTeacherLeaveStats } from "./admin-teacher-leave-stats";
import { AdminTeacherLeaveTable } from "./admin-teacher-leave-table";
import { AdminTeacherLeaveFilters } from "./admin-teacher-leave-filters";
import { getFilteredTeacherLeaves } from "@/lib/action/admin-teacher-leave.action";

export default async function AdminTeacherLeavePage() {
  // Check if the user is an admin
  const leaves = await getFilteredTeacherLeaves({});
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

        <Suspense fallback={<div>Loading statistics...</div>}>
          <AdminTeacherLeaveStats />
        </Suspense>

        <div className="rounded-lg border bg-card">
          <div className="p-6 flex flex-col gap-6">
            <h2 className="text-xl font-semibold">Leave Requests</h2>

            <Suspense fallback={<div>Loading filters...</div>}>
              <AdminTeacherLeaveFilters />
            </Suspense>

            <Suspense fallback={<div>Loading leave requests...</div>}>
              <AdminTeacherLeaveTable leaves={leaves} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
