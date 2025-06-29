import { getTeachersForAbsent } from "@/lib/action/absent.action";
import { DepartmentFilter } from "../ahistory/components/department-filter";
import { AbsentForm } from "./components/absent-form";

import { UserX } from "lucide-react";
import { DateSelector } from "./components/m-date-picker";

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
  searchParams: Promise<{
    page?: string;
    absentDepartment?: string;
    date?: string;
  }>;
}) {
  const params = await searchParams;
  const selectedDepartment =
    params.absentDepartment === "all" ? undefined : params.absentDepartment;

  // Get selected date from URL params or default to today
  const selectedDateString =
    params.date || new Date().toISOString().split("T")[0];
  const selectedDate = new Date(selectedDateString);

  // Check if selected date is Sunday
  const isSunday = selectedDate.getDay() === 0;

  // Format date for display
  const displayDate = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Get teachers for the selected date (skip if Sunday)
  const teachers = isSunday
    ? []
    : await getTeachersForAbsent(selectedDepartment, selectedDateString);

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

        <div className="flex flex-col sm:flex-row gap-3">
          <DateSelector initialDate={selectedDateString} />
          <DepartmentFilter
            departments={departmentList}
            paramName="absentDepartment"
            path="/absent"
          />
        </div>
      </div>

      {isSunday ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <UserX className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Sunday Selected
          </h3>
          <p className="text-yellow-700">
            No attendance marking is available on Sundays. Please select a
            different date.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-[#4285f4] text-white py-3 px-6 font-medium flex items-center">
            <UserX className="h-5 w-5 mr-2" />
            <span>Staff Without Attendance</span>
            <div className="ml-auto flex items-center text-sm">
              <span>{displayDate}</span>
            </div>
          </div>

          {teachers.length === 0 ? (
            <div className="p-8 text-center">
              <UserX className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No Staff Found
              </h3>
              <p className="text-gray-500">
                All staff members have already marked their attendance for{" "}
                {displayDate}
                {selectedDepartment && ` in ${selectedDepartment} department`}.
              </p>
            </div>
          ) : (
            <AbsentForm teachers={teachers} selectedDate={selectedDateString} />
          )}
        </div>
      )}
    </div>
  );
}
