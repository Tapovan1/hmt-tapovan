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
import {
  Calendar,
  Check,
  X,
  Eye,
  Trash2,
  Clock,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
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

export function AdminTeacherLeaveTable({ leaves }: { leaves: TeacherLeave[] }) {
  const router = useRouter();
  const [selectedLeave, setSelectedLeave] = useState<TeacherLeave | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [actionType, setActionType] = useState<"APPROVED" | "REJECTED" | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);

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
      setIsProcessing(true);
      const formData = new FormData();
      formData.append("id", id);
      formData.append("status", status);

      try {
        await updateLeaveStatus(formData);
        toast.success("Leave status updated successfully");
        router.refresh();
      } catch (error) {
        toast.error("Failed to update leave status");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!selectedLeave || !actionType) return;

    setIsProcessing(true);
    const formData = new FormData();
    formData.append("id", selectedLeave.id);
    formData.append("status", actionType);
    formData.append("feedback", feedback);

    try {
      await updateLeaveStatus(formData);
      toast.success("Leave status updated successfully");
      setFeedbackOpen(false);
      setFeedback("");
      setSelectedLeave(null);
      setActionType(null);
      router.refresh();
    } catch (error) {
      toast.error("Failed to update leave status");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsProcessing(true);
    try {
      await deleteTeacherLeave(id);
      toast.success("Leave request deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete leave request");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewDetails = (leave: TeacherLeave) => {
    setSelectedLeave(leave);
    setViewDetailsOpen(true);
  };

  if (leaves.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="bg-gray-100 p-4 rounded-full mb-4">
          <Calendar className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-700">
          No leave requests found
        </h3>
        <p className="text-gray-500 mt-2">
          There are currently no teacher leave requests in the system.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="py-4 px-6 font-medium text-gray-700">
                Teacher
              </TableHead>
              <TableHead className="py-4 px-6 font-medium text-gray-700">
                Department
              </TableHead>
              <TableHead className="py-4 px-6 font-medium text-gray-700">
                Start Date
              </TableHead>
              <TableHead className="py-4 px-6 font-medium text-gray-700">
                End Date
              </TableHead>
              <TableHead className="py-4 px-6 font-medium text-gray-700">
                Days
              </TableHead>
              <TableHead className="py-4 px-6 font-medium text-gray-700">
                Status
              </TableHead>
              <TableHead className="py-4 px-6 font-medium text-gray-700 text-center">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaves.map((leave) => (
              <TableRow
                key={leave.id}
                className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
              >
                <TableCell className="py-4 px-6 font-medium text-gray-800">
                  {leave.name}
                </TableCell>
                <TableCell className="py-4 px-6 text-gray-700">
                  {leave.department}
                </TableCell>
                <TableCell className="py-4 px-6 text-gray-700">
                  {format(new Date(leave.startDate), "dd MMM yyyy")}
                </TableCell>
                <TableCell className="py-4 px-6 text-gray-700">
                  {format(new Date(leave.endDate), "dd MMM yyyy")}
                </TableCell>
                <TableCell className="py-4 px-6">
                  <div className="flex items-center gap-1 text-gray-700">
                    <Calendar className="h-4 w-4 text-[#4285f4]" />
                    <span>
                      {leave.totalDays ||
                        calculateDays(leave.startDate, leave.endDate)}{" "}
                      {leave.totalDays === 1 ||
                      calculateDays(leave.startDate, leave.endDate) === 1
                        ? "day"
                        : "days"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <StatusBadge status={leave.status} />
                </TableCell>
                <TableCell className="py-4 px-6">
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewDetails(leave)}
                      title="View Details"
                      className="h-8 w-8 text-gray-500 hover:text-[#4285f4]"
                      disabled={isProcessing}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    {leave.status === "PENDING" && (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                          onClick={() =>
                            handleStatusUpdate(leave.id, "APPROVED")
                          }
                          title="Approve"
                          disabled={isProcessing}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          onClick={() =>
                            handleStatusUpdate(leave.id, "REJECTED")
                          }
                          title="Reject"
                          disabled={isProcessing}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}

                    {leave.status === "APPROVED" && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        onClick={() => handleStatusUpdate(leave.id, "REJECTED")}
                        title="Reject"
                        disabled={isProcessing}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    {leave.status === "REJECTED" && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                        onClick={() => handleStatusUpdate(leave.id, "APPROVED")}
                        title="Approve"
                        disabled={isProcessing}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-red-600"
                      onClick={() => handleDelete(leave.id)}
                      title="Delete"
                      disabled={isProcessing}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* View Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="p-6 pb-2 border-b">
            <DialogTitle className="text-xl font-semibold">
              Leave Request Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about the leave request.
            </DialogDescription>
          </DialogHeader>

          {selectedLeave && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Teacher</p>
                  <p className="text-base font-medium text-gray-800">
                    {selectedLeave.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Department
                  </p>
                  <p className="text-base text-gray-700">
                    {selectedLeave.department}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Start Date
                  </p>
                  <p className="text-base text-gray-700">
                    {format(new Date(selectedLeave.startDate), "PPP")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">End Date</p>
                  <p className="text-base text-gray-700">
                    {format(new Date(selectedLeave.endDate), "PPP")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Days
                  </p>
                  <div className="flex items-center gap-1 text-base text-gray-700">
                    <Calendar className="h-4 w-4 text-[#4285f4]" />
                    <span>
                      {selectedLeave.totalDays ||
                        calculateDays(
                          selectedLeave.startDate,
                          selectedLeave.endDate
                        )}{" "}
                      {selectedLeave.totalDays === 1 ||
                      calculateDays(
                        selectedLeave.startDate,
                        selectedLeave.endDate
                      ) === 1
                        ? "day"
                        : "days"}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <StatusBadge status={selectedLeave.status} className="mt-1" />
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Reason</p>
                <div className="p-3 bg-gray-50 rounded-md text-gray-700 border border-gray-100">
                  {selectedLeave.reason}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Requested On
                  </p>
                  <p className="text-sm text-gray-700">
                    {format(new Date(selectedLeave.createdAt), "PPP")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Last Updated
                  </p>
                  <p className="text-sm text-gray-700">
                    {format(new Date(selectedLeave.updatedAt), "PPP")}
                  </p>
                </div>
              </div>

              {selectedLeave.status === "PENDING" && (
                <div className="flex gap-2 justify-end pt-2 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setViewDetailsOpen(false);
                      handleStatusUpdate(selectedLeave.id, "APPROVED");
                    }}
                    className="border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700"
                    disabled={isProcessing}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setViewDetailsOpen(false);
                      handleStatusUpdate(selectedLeave.id, "REJECTED");
                    }}
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    disabled={isProcessing}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}

              {selectedLeave.status === "APPROVED" && (
                <div className="flex gap-2 justify-end pt-2 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setViewDetailsOpen(false);
                      handleStatusUpdate(selectedLeave.id, "REJECTED");
                    }}
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    disabled={isProcessing}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}

              {selectedLeave.status === "REJECTED" && (
                <div className="flex gap-2 justify-end pt-2 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setViewDetailsOpen(false);
                      handleStatusUpdate(selectedLeave.id, "APPROVED");
                    }}
                    className="border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700"
                    disabled={isProcessing}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog
        open={feedbackOpen}
        onOpenChange={(open) => !isProcessing && setFeedbackOpen(open)}
      >
        <DialogContent className="sm:max-w-[500px] p-0">
          <DialogHeader className="p-6 pb-2 border-b">
            <DialogTitle className="text-xl font-semibold">
              {actionType === "APPROVED" ? "Approve" : "Reject"} Leave Request
            </DialogTitle>
            <DialogDescription>
              {actionType === "APPROVED"
                ? "Add an optional note for approving this leave request."
                : "Please provide a reason for rejecting this leave request."}
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-4">
            <Textarea
              placeholder={
                actionType === "APPROVED"
                  ? "Optional: Add a note..."
                  : "Please provide a reason for rejection..."
              }
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[100px] border-gray-200 focus:border-[#4285f4] focus:ring-[#4285f4]"
            />
          </div>

          <DialogFooter className="p-6 pt-0 border-t mt-4 flex flex-col-reverse sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setFeedbackOpen(false)}
              className="w-full sm:w-auto border-gray-200"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleFeedbackSubmit}
              className={`w-full sm:w-auto ${
                actionType === "APPROVED"
                  ? "bg-[#4285f4] hover:bg-[#3b78e7]"
                  : "bg-red-600 hover:bg-red-700"
              } text-white`}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                  Processing...
                </>
              ) : actionType === "APPROVED" ? (
                "Approve"
              ) : (
                "Reject"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function StatusBadge({
  status,
  className = "",
}: {
  status: string;
  className?: string;
}) {
  switch (status.toUpperCase()) {
    case "APPROVED":
      return (
        <Badge
          className={`bg-green-100 text-green-800 hover:bg-green-100 border-green-200 flex items-center gap-1 ${className}`}
        >
          <CheckCircle className="h-3 w-3" />
          <span>Approved</span>
        </Badge>
      );
    case "PENDING":
      return (
        <Badge
          className={`bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-50 flex items-center gap-1 ${className}`}
        >
          <Clock className="h-3 w-3" />
          <span>Pending</span>
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge
          className={`bg-red-100 text-red-800 border-red-200 hover:bg-red-100 flex items-center gap-1 ${className}`}
        >
          <AlertTriangle className="h-3 w-3" />
          <span>Rejected</span>
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className={className}>
          {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
        </Badge>
      );
  }
}
