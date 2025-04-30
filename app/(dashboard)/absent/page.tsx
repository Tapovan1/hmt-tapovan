import { getTeachersForAbsent } from "@/lib/action/absent.action";
import { DepartmentFilter } from "../ahistory/components/department-filter";
import { AbsentForm } from "./components/absent-form";

const departmentList = [
  "Admin",
  "Computer Operator",
  "Clerk",
  "Primary",
  "SSC",
  "HSC",
  "Foundation",
  "HSC (Ahmd)",
  "GCI",
  "Peon",
  "Security",
  "Guest",
  "Accountant",
];

export default async function AdminHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; absentDepartment?: string }>;
}) {
  const params = await searchParams;

  const selectedDepartment =
    params.absentDepartment === "all" ? undefined : params.absentDepartment;

  const teachers = await getTeachersForAbsent(selectedDepartment);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Mark Absent</h1>
        <DepartmentFilter
          departments={departmentList}
          paramName="absentDepartment" // this is fine
          path="/absent"
        />
      </div>

      <AbsentForm teachers={teachers} />
    </div>
  );
}
