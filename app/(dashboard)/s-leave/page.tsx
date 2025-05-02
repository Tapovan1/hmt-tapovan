import { SecurityAbsenceTable } from "@/components/security-absence-table";
import DateSelector from "@/components/month-year";

export default async function SecurityPage({
  searchParams,
}: {
  searchParams: { month?: string; year?: string };
}) {
  // Get current date if no search params
  const today = new Date();
  const currentMonth = searchParams.month
    ? Number.parseInt(searchParams.month)
    : today.getMonth() + 1;
  const currentYear = searchParams.year
    ? Number.parseInt(searchParams.year)
    : today.getFullYear();

  return (
    <div className="container px-4 py-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">
            Student Absence Management
          </h1>
          <div className="flex gap-2">
            <DateSelector />
          </div>
        </div>

        <SecurityAbsenceTable month={currentMonth} year={currentYear} />
      </div>
    </div>
  );
}
