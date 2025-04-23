import { format } from "date-fns";
import { getStudentAbsences } from "@/lib/action/student-absence.action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit } from "lucide-react";
import { StudentAbsenceDialog } from "./student-absence-dialog";
import DeleteButton from "./delete-button";

export async function StudentAbsenceTable({
  month,
  year,
}: {
  month: number;
  year: number;
}) {
  const absences = await getStudentAbsences(month, year);

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
          {absences.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                No absences found for this period
              </TableCell>
            </TableRow>
          ) : (
            absences.map((absence) => (
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
                    ? format(new Date(absence.outTime), "HH:mm")
                    : "N/A"}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-2">
                    <StudentAbsenceDialog absence={absence}>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </StudentAbsenceDialog>
                    <DeleteButton id={absence.id} />
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
