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
import { ViewPhotoButton } from "../app/(dashboard)/s-leave/view-photo-button";
import { ConfirmStatusButton } from "../app/(dashboard)/s-leave/confirm-status-button";
import { formatIndianTime } from "@/lib/utils/date-format";

export async function SecurityAbsenceTable({
  month,
  year,
}: {
  month: number;
  year: number;
}) {
  const absences = await getStudentAbsences(month, year);

  // Filter to show only today's absences by default
  const today = new Date();
  const todayString = format(today, "yyyy-MM-dd");

  const todayAbsences = absences.filter((absence) => {
    const absenceDate = format(new Date(absence.date), "yyyy-MM-dd");
    return absenceDate === todayString;
  });

  const displayAbsences = todayAbsences.length > 0 ? todayAbsences : absences;

  return (
    <div className="rounded-md border">
      <Table className="text-center">
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Date</TableHead>
            <TableHead className="text-center">Roll No</TableHead>
            <TableHead className="text-center">Student Name</TableHead>
            <TableHead className="text-center">Class</TableHead>
            <TableHead className="text-center">Parent Name</TableHead>
            <TableHead className="text-center">Reason</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Out Time</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayAbsences.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center">
                No absences found for this period
              </TableCell>
            </TableRow>
          ) : (
            displayAbsences.map((absence) => (
              <TableRow key={absence.id}>
                <TableCell>
                  {format(new Date(absence.date), "dd MMM yyyy")}
                </TableCell>
                <TableCell>{absence.rollNo}</TableCell>
                <TableCell className="font-medium">
                  <div>{absence.studentName}</div>
                </TableCell>
                <TableCell>{absence.class}</TableCell>
                <TableCell>{absence.parentName}</TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {absence.purpose}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      absence.status === "DONE"
                        ? "outline"
                        : absence.status === "PENDING"
                        ? "destructive"
                        : "outline"
                    }
                  >
                    {absence.status.charAt(0) +
                      absence.status.slice(1).toLowerCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {absence.outTime
                    ? formatIndianTime(absence.outTime.toString())
                    : "N/A"}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-2">
                    <ViewPhotoButton absenceId={absence.id} />
                    <ConfirmStatusButton
                      absenceId={absence.id}
                      currentStatus={absence.status}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
