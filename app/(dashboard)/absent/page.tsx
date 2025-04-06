import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTeachersForAbsent } from "@/lib/action/absent.action";
import { getDepartments } from "@/lib/action/history.action";
import { DepartmentFilter } from "../ahistory/components/department-filter";
import { AbsentForm } from "./components/absent-form";

export default async function AdminHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; department?: string }>;
}) {
  const params = await searchParams;

  const department =
    params.department === "all" ? undefined : params.department;

  const [teachers, departments] = await Promise.all([
    getTeachersForAbsent(department),
    getDepartments(),
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Mark Absent</h1>
        <DepartmentFilter
          departments={departments}
          paramName="absentDepartment"
          path="/absent"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teachers Pending Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <AbsentForm teachers={teachers} />
        </CardContent>
      </Card>
    </div>
  );
}
