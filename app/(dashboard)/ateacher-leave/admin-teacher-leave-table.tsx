"use client";

import { useState } from "react";
import { format, differenceInCalendarDays } from "date-fns";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Check, X, Eye, Trash2 } from "lucide-react";
import {
  updateLeaveStatus,
  deleteTeacherLeave,
} from "@/lib/action/teacherLeave.action";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface TeacherLeave {
  id: string;
  userId: string;
  name: string;
  department: string;
  startDate: Date;
  endDate: Date;
  totalDays?: number;
  reason: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// Update the component to properly handle the leaves prop
export function AdminTeacherLeaveTable({ leaves }: { leaves: TeacherLeave[] }) {
  const router = useRouter();
  const [selectedLeave, setSelectedLeave] = useState<TeacherLeave | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [actionType, setActionType] = useState<"APPROVED" | "REJECTED" | null>(
    null
  );

  // Helper function to calculate days
  const calculateDays = (startDate: Date, endDate: Date) => {
    return differenceInCalendarDays(new Date(endDate), new Date(startDate)) + 1;
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    if (status === "APPROVED" || status === "REJECTED") {
      // If feedback is enabled, open the feedback dialog
      if (status === "REJECTED") {
        setSelectedLeave(leaves.find((leave) => leave.id === id) || null);
        setActionType(status as "APPROVED" | "REJECTED");
        setFeedbackOpen(true);
        return;
      }

      // Otherwise proceed with the update
      const formData = new FormData();
      formData.append("id", id);
      formData.append("status", status);

      try {
        await updateLeaveStatus(formData);
        toast("Leave status updated successfully");

        router.refresh();
      } catch (error) {
        toast("Failed to update leave status");
      }
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!selectedLeave || !actionType) return;

    const formData = new FormData();
    formData.append("id", selectedLeave.id);
    formData.append("status", actionType);
    formData.append("feedback", feedback);

    try {
      await updateLeaveStatus(formData);
      toast("Leave status updated successfully");
      setFeedbackOpen(false);
      setFeedback("");
      setSelectedLeave(null);
      setActionType(null);
      router.refresh();
    } catch (error) {
      toast("Failed to update leave status");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTeacherLeave(id);
      toast("Leave request deleted successfully");
      router.refresh();
    } catch (error) {
      toast("Failed to delete leave request");
    }
  };

  const handleViewDetails = (leave: TeacherLeave) => {
    setSelectedLeave(leave);
    setViewDetailsOpen(true);
  };
  console.log(leaves, "leaves");

  return (
    <>
      <div className="rounded-md border">
        <Table className="text-center">
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Teacher</TableHead>
              <TableHead className="text-center">Department</TableHead>
              <TableHead className="text-center">Start Date</TableHead>
              <TableHead className="text-center">End Date</TableHead>
              <TableHead className="text-center">Days</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaves.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No leave requests found
                </TableCell>
              </TableRow>
            ) : (
              leaves.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell className="font-medium">{leave.name}</TableCell>
                  <TableCell>{leave.department}</TableCell>
                  <TableCell>
                    {format(new Date(leave.startDate), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell>
                    {format(new Date(leave.endDate), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {leave.totalDays ||
                          calculateDays(leave.startDate, leave.endDate)}{" "}
                        day
                        {leave.totalDays !== 1 ||
                        calculateDays(leave.startDate, leave.endDate) !== 1
                          ? "s"
                          : ""}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        leave.status === "APPROVED"
                          ? "success"
                          : leave.status === "PENDING"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {leave.status.charAt(0) +
                        leave.status.slice(1).toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDetails(leave)}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {leave.status === "Pending" && (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-green-500"
                            onClick={() =>
                              handleStatusUpdate(leave.id, "APPROVED")
                            }
                            title="Approve"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-500"
                            onClick={() =>
                              handleStatusUpdate(leave.id, "REJECTED")
                            }
                            title="Reject"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}

                      {leave.status === "APPROVED" && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-red-500"
                          onClick={() =>
                            handleStatusUpdate(leave.id, "REJECTED")
                          }
                          title="Reject"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      {leave.status === "REJECTED" && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-green-500"
                          onClick={() =>
                            handleStatusUpdate(leave.id, "APPROVED")
                          }
                          title="Approve"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                        onClick={() => handleDelete(leave.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
            <DialogDescription>
              Detailed information about the leave request.
            </DialogDescription>
          </DialogHeader>

          {selectedLeave && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Teacher
                  </p>
                  <p className="text-sm">{selectedLeave.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Department
                  </p>
                  <p className="text-sm">{selectedLeave.department}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Start Date
                  </p>
                  <p className="text-sm">
                    {format(new Date(selectedLeave.startDate), "PPP")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    End Date
                  </p>
                  <p className="text-sm">
                    {format(new Date(selectedLeave.endDate), "PPP")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Days
                  </p>
                  <p className="text-sm">
                    {selectedLeave.totalDays ||
                      calculateDays(
                        selectedLeave.startDate,
                        selectedLeave.endDate
                      )}{" "}
                    days
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Status
                  </p>
                  <Badge
                    variant={
                      selectedLeave.status === "APPROVED"
                        ? "success"
                        : selectedLeave.status === "PENDING"
                        ? "secondary"
                        : "destructive"
                    }
                    className="mt-1"
                  >
                    {selectedLeave.status.charAt(0) +
                      selectedLeave.status.slice(1).toLowerCase()}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Reason
                </p>
                <p className="text-sm mt-1 p-3 bg-muted rounded-md">
                  {selectedLeave.reason}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Requested On
                  </p>
                  <p className="text-sm">
                    {format(new Date(selectedLeave.createdAt), "PPP")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Last Updated
                  </p>
                  <p className="text-sm">
                    {format(new Date(selectedLeave.updatedAt), "PPP")}
                  </p>
                </div>
              </div>

              {selectedLeave.status === "PENDING" && (
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleStatusUpdate(selectedLeave.id, "APPROVED")
                    }
                    className="text-green-500"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleStatusUpdate(selectedLeave.id, "REJECTED")
                    }
                    className="text-red-500"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}

              {selectedLeave.status === "APPROVED" && (
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleStatusUpdate(selectedLeave.id, "REJECTED")
                    }
                    className="text-red-500"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {actionType === "APPROVED" ? "Approve" : "Reject"} Leave Request
            </DialogTitle>
            <DialogDescription>
              {actionType === "APPROVED"
                ? "Add an optional note for approving this leave request."
                : "Please provide a reason for rejecting this leave request."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              placeholder={
                actionType === "APPROVED"
                  ? "Optional: Add a note..."
                  : "Please provide a reason for rejection..."
              }
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleFeedbackSubmit}
              variant={actionType === "APPROVED" ? "default" : "destructive"}
            >
              {actionType === "APPROVED" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
