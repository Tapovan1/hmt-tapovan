import { Suspense } from "react";
import { format } from "date-fns";
import { getTeacherLeaves } from "@/lib/action/teacherLeave.action";
import { TeacherLeaveDialog } from "./teacher-leave-dialog";
import {
  CalendarDays,
  CheckCircle,
  CircleX,
  Clock,
  Edit,
  Plus,
} from "lucide-react";
import DateSelector from "@/components/month-year";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DeleteButton from "./delete-button";

interface TeacherLeavesPageProps {
  searchParams: {
    month?: string;
    year?: string;
  };
}

export default function TeacherLeavesPage({
  searchParams,
}: TeacherLeavesPageProps) {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Get month and year from URL params or use current date as fallback
  const selectedMonth = searchParams.month
    ? Number.parseInt(searchParams.month)
    : currentMonth;
  const selectedYear = searchParams.year
    ? Number.parseInt(searchParams.year)
    : currentYear;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-xl">
              <CalendarDays className="h-7 w-7 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Leave Requests</h1>
          </div>

          {/* Right side controls - properly aligned */}
          <div className="flex items-center gap-3">
            <TeacherLeaveDialog>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm">
                <Plus className="h-4 w-4 mr-2" />
                Request Leave
              </Button>
            </TeacherLeaveDialog>
            <DateSelector
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
            />
          </div>
        </div>

        {/* Modern Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <h2 className="text-white font-semibold text-lg">
              My Leave Requests - {getMonthName(selectedMonth)} {selectedYear}
            </h2>
          </div>

          {/* Table Content */}
          <Suspense
            key={`${selectedMonth}-${selectedYear}`}
            fallback={<LeaveTableSkeleton />}
          >
            <TeacherLeaveTableContent
              month={selectedMonth}
              year={selectedYear}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

async function TeacherLeaveTableContent({
  month,
  year,
}: {
  month: number;
  year: number;
}) {
  const leaves = await getTeacherLeaves(month, year);

  if (leaves.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <CalendarDays className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No leave requests found
        </h3>
        <p className="text-gray-500 text-lg">
          No leave requests found for {getMonthName(month)} {year}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Start Date
            </th>
            <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">
              End Date
            </th>
            <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Total Days
            </th>
            <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Reason
            </th>
            <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Status
            </th>
            {leaves.some((leave) => leave.status === "PENDING") && (
              <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {leaves.map((leave, index) => (
            <tr
              key={leave.id}
              className="hover:bg-blue-50 transition-colors duration-200"
            >
              <td className="py-5 px-6 text-center">
                <div className="text-sm font-semibold text-gray-900">
                  {format(new Date(leave.startDate), "dd MMM yyyy")}
                </div>
              </td>
              <td className="py-5 px-6 text-center">
                <div className="text-sm font-semibold text-gray-900">
                  {format(new Date(leave.endDate), "dd MMM yyyy")}
                </div>
              </td>
              <td className="py-5 px-6 text-center">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 text-sm font-bold rounded-full">
                  {leave.totalDays}
                </span>
              </td>
              <td className="py-5 px-6 text-center">
                <div
                  className="text-sm text-gray-700 max-w-xs mx-auto truncate"
                  title={leave.reason}
                >
                  {leave.reason}
                </div>
              </td>
              <td className="py-5 px-6 text-center">
                <StatusBadge status={leave.status} />
              </td>
              {leave.status === "PENDING" && (
                <td className="py-5 px-6 text-center">
                  <div className="flex justify-center gap-2">
                    <TeacherLeaveDialog leave={leave}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </TeacherLeaveDialog>
                    <DeleteButton id={leave.id} />
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status.toUpperCase()) {
    case "APPROVED":
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
          <CheckCircle className="h-3.5 w-3.5 mr-1" />
          Approved
        </span>
      );
    case "PENDING":
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
          <Clock className="h-3.5 w-3.5 mr-1" />
          Pending
        </span>
      );
    case "REJECTED":
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
          <CircleX className="h-3.5 w-3.5 mr-1" />
          Rejected
        </span>
      );
    default:
      return (
        <Badge variant="outline" className="text-xs font-semibold">
          {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
        </Badge>
      );
  }
}

function LeaveTableSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex-1 py-4 px-6">
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex border-b border-gray-200">
            {[1, 2, 3, 4, 5].map((j) => (
              <div key={j} className="flex-1 py-5 px-6">
                <div className="h-4 bg-gray-200 rounded mx-auto w-20"></div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function getMonthName(month: number): string {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[month - 1];
}
