import { Suspense } from "react";
import type { Metadata } from "next";
import DateSelector from "@/components/month-year";
import { StudentAbsenceTable } from "./student-absence-table";
import { StudentAbsenceDialog } from "./student-absence-dialog";

export const metadata: Metadata = {
  title: "Student Absence Management",
  description: "Manage student absences and leaves",
};

export default async function StudentAbsencePage({
  searchParams,
}: {
  searchParams: { month?: string; year?: string };
}) {
  const { month, year } = await searchParams;
  const monthNumber = month
    ? Number.parseInt(month)
    : new Date().getMonth() + 1;
  const yearNumber = year ? Number.parseInt(year) : new Date().getFullYear();
  return (
    <div className="container px-4 py-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Student Absence Management
          </h1>
          <p className="text-muted-foreground">
            Manage student leaves and absences from school
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <DateSelector />
          <StudentAbsenceDialog />
        </div>
      </div>

      <Suspense
        fallback={
          <div className="w-full h-96 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p>Loading student data...</p>
            </div>
          </div>
        }
      >
        <StudentAbsenceTable month={monthNumber} year={yearNumber} />
      </Suspense>
    </div>
  );
}
