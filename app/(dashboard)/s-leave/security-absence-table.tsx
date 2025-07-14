import { format } from "date-fns";
import { getStudentAbsences } from "@/lib/action/student-absence.action";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserX } from "lucide-react";
import { ConfirmStatusButton } from "./confirm-status-button";
import { ViewPhotoButton } from "./view-photo-button";
import { formatIndianTime } from "@/lib/utils/date-format";

export async function SecurityAbsenceTable({ date }: { date: Date }) {
  const absences = await getStudentAbsences(date);

  if (absences.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="bg-gray-100 p-4 rounded-full mb-4">
          <UserX className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-700">
          No leave records found
        </h3>
        <p className="text-gray-500 mt-2">
          No student leave records found for this period. Records will appear
          here when students request to leave.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="py-4 px-6 font-medium text-gray-700">
              Date
            </TableHead>
            <TableHead className="py-4 px-6 font-medium text-gray-700">
              Roll No
            </TableHead>
            <TableHead className="py-4 px-6 font-medium text-gray-700">
              Student Name
            </TableHead>
            <TableHead className="py-4 px-6 font-medium text-gray-700">
              Class
            </TableHead>
            <TableHead className="py-4 px-6 font-medium text-gray-700">
              Parent Name
            </TableHead>
            <TableHead className="py-4 px-6 font-medium text-gray-700">
              Reason
            </TableHead>
            <TableHead className="py-4 px-6 font-medium text-gray-700">
              Status
            </TableHead>
            <TableHead className="py-4 px-6 font-medium text-gray-700">
              Out Time
            </TableHead>
            <TableHead className="py-4 px-6 font-medium text-gray-700 text-center">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {absences.map((absence) => (
            <TableRow
              key={absence.id}
              className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
            >
              <TableCell className="py-4 px-6 font-medium text-gray-800">
                {format(new Date(absence.date), "dd MMM yyyy")}
              </TableCell>
              <TableCell className="py-4 px-6 text-gray-700">
                {absence.rollNo}
              </TableCell>
              <TableCell className="py-4 px-6 font-medium text-gray-800">
                {absence.studentName}
              </TableCell>
              <TableCell className="py-4 px-6 text-gray-700">
                {absence.class}
              </TableCell>
              <TableCell className="py-4 px-6 text-gray-700">
                {absence.parentName}
              </TableCell>
              <TableCell className="py-4 px-6 text-gray-700 max-w-[200px] truncate">
                {absence.purpose}
              </TableCell>
              <TableCell className="py-4 px-6">
                <StatusBadge status={absence.status} />
              </TableCell>
              <TableCell className="py-4 px-6 text-gray-700">
                {absence.outTime
                  ? formatIndianTime(absence.outTime.toISOString())
                  : "N/A"}
              </TableCell>
              <TableCell className="py-4 px-6">
                <div className="flex justify-center gap-2">
                  <ViewPhotoButton absenceId={absence.photo} />
                  <ConfirmStatusButton
                    absenceId={absence.id}
                    currentStatus={absence.status}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status.toUpperCase()) {
    case "DONE":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
          Done
        </Badge>
      );
    case "PENDING":
      return (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-50"
        >
          Pending
        </Badge>
      );
    default:
      return (
        <Badge variant="outline">
          {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
        </Badge>
      );
  }
}
