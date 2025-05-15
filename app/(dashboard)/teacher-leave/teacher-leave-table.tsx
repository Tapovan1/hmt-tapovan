import { format } from "date-fns";
import { getTeacherLeaves } from "@/lib/action/teacherLeave.action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, CircleX, Clock, Edit } from "lucide-react";
import { TeacherLeaveDialog } from "./teacher-leave-dialog";
import DeleteButton from "./delete-button";

export async function TeacherLeaveTable({
  month,
  year,
}: {
  month: number;
  year: number;
}) {
  const leaves = await getTeacherLeaves(month, year);

  if (leaves.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="h-6 w-6 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-700">
          No leave requests found
        </h3>
        <p className="text-gray-500 mt-2">
          Use the "Request Leave" button to create a new leave request
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-center py-4 px-6 font-medium text-gray-700">
              Start Date
            </th>
            <th className="text-center py-4 px-6 font-medium text-gray-700">
              End Date
            </th>

            <th className="text-center py-4 px-6 font-medium text-gray-700">
              Total Days
            </th>
            <th className="text-center py-4 px-6 font-medium text-gray-700">
              Reason
            </th>
            <th className="text-center py-4 px-6 font-medium text-gray-700">
              Status
            </th>
            {leaves.some((leave) => leave.status === "PENDING") && (
              <th className="text-center py-4 px-6 font-medium text-gray-700">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {leaves.map((leave) => (
            <tr
              key={leave.id}
              className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
            >
              <td className="py-4 px-6 text-center font-medium text-gray-800">
                {format(new Date(leave.startDate), "dd MMM yyyy")}
              </td>
              <td className="py-4 px-6 text-center font-medium  text-gray-800">
                {format(new Date(leave.endDate), "dd MMM yyyy")}
              </td>

              <td className="py-4 px-6 text-center  text-gray-700">
                {leave.totalDays}
              </td>
              <td className="py-4 px-6 text-center text-gray-700 max-w-[200px] truncate">
                {leave.reason}
              </td>
              <td className="flex items-center justify-center py-4 px-6">
                <StatusBadge status={leave.status} />
              </td>
              {leave.status === "PENDING" && (
                <td className="py-4 px-6 text-center">
                  <div className="flex justify-center gap-2">
                    <TeacherLeaveDialog leave={leave}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-[#4285f4]"
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
        <div className="flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
          <CheckCircle className="h-3.5 w-3.5 mr-1" />
          Approved
        </div>
      );
    case "PENDING":
      return (
        <div className="flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium">
          <Clock className="h-3.5 w-3.5 mr-1" />
          Pending
        </div>
      );
    case "REJECTED":
      return (
        <div className="flex items-center px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium">
          <CircleX className="h-3.5 w-3.5 mr-1" />
          Rejected
        </div>
      );
    default:
      return (
        <Badge variant="outline">
          {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
        </Badge>
      );
  }
}
