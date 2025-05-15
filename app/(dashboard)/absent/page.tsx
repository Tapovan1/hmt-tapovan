import { getTeachersForAbsent } from "@/lib/action/absent.action";
import { DepartmentFilter } from "../ahistory/components/department-filter";
import { AbsentForm } from "./components/absent-form";
import { UserX } from "lucide-react";

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

export default async function AdminAbsentPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; absentDepartment?: string }>;
}) {
  const params = await searchParams;

  const selectedDepartment =
    params.absentDepartment === "all" ? undefined : params.absentDepartment;

  const teachers = await getTeachersForAbsent(selectedDepartment);

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-[#e6eef8] p-3 rounded-full">
            <UserX className="h-6 w-6 text-[#4285f4]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Mark Absent
          </h1>
        </div>
        <DepartmentFilter
          departments={departmentList}
          paramName="absentDepartment"
          path="/absent"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="bg-[#4285f4] text-white py-3 px-6 font-medium flex items-center">
          <UserX className="h-5 w-5 mr-2" />
          <span>Staff Without Attendance</span>
          <div className="ml-auto flex items-center text-sm">
            <span>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        <AbsentForm teachers={teachers} />
      </div>
    </div>
  );
}
