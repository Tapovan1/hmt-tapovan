import { format } from "date-fns";
import { getTeacherLeaves } from "@/lib/action/teacherLeave.action";
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

  return (
    <div className="rounded-md border">
      <Table className="text-center">
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Start Date</TableHead>
            <TableHead className="text-center">End Date</TableHead>

            <TableHead className="text-center">Teacher Name</TableHead>
            <TableHead className="text-center">Department</TableHead>
            <TableHead className="text-center">Reason</TableHead>
            <TableHead className="text-center">Status</TableHead>
            {leaves.some((leave) => leave.status === "PENDING") ? (
              <TableHead className="text-center">Actions</TableHead>
            ) : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaves.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                No leave requests found for this period
              </TableCell>
            </TableRow>
          ) : (
            leaves.map((leave) => (
              <TableRow key={leave.id}>
                <TableCell>
                  {format(new Date(leave.startDate), "dd MMM yyyy")}
                </TableCell>
                <TableCell>
                  {format(new Date(leave.endDate), "dd MMM yyyy")}
                </TableCell>

                <TableCell className="font-medium">
                  <div>{leave.name}</div>
                </TableCell>
                <TableCell>{leave.department}</TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {leave.reason}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      leave.status === "APPROVED"
                        ? "default"
                        : leave.status === "PENDING"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {leave.status.charAt(0) +
                      leave.status.slice(1).toLowerCase()}
                  </Badge>
                </TableCell>
                {leave.status === "PENDING" ? (
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <TeacherLeaveDialog leave={leave}>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TeacherLeaveDialog>
                      <DeleteButton id={leave.id} />
                    </div>
                  </TableCell>
                ) : null}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
