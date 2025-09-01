"use client";
import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import {
  createTeacherLeave,
  updateTeacherLeave,
} from "@/lib/action/teacherLeave.action";

export function TeacherLeaveDialog({
  children,
  leave,
}: {
  children?: React.ReactNode;
  leave?: any;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Convert dates to string format for input fields
  const [startDate, setStartDate] = useState<string>(
    leave?.start
      ? (() => {
          const date = new Date(leave.start);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        })()
      : "",
  );

  const [endDate, setEndDate] = useState<string>(
    leave?.end
      ? (() => {
          const date = new Date(leave.end);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        })()
      : "",
  );

  const [reason, setReason] = useState(leave?.reason || "");

  async function onSubmit() {
    if (!startDate || !endDate) {
      return;
    }

    // Convert string dates to Date objects
    const adjustedStartDate = new Date(startDate);
    const adjustedEndDate = new Date(endDate);

    adjustedStartDate.setDate(adjustedStartDate.getDate() + 1);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
    adjustedStartDate.setHours(0, 0, 0, 0);
    adjustedEndDate.setHours(0, 0, 0, 0);

    const data = {
      id: leave?.id,
      start: adjustedStartDate,
      end: adjustedEndDate,
      reason,
    };

    try {
      const promise = async () => {
        if (data.id) {
          const res = await updateTeacherLeave(data);
          if (!res.success) throw new Error(res.message || "Update failed");
          return { type: "update" };
        } else {
          const res = await createTeacherLeave(data);
          if (!res.success) throw new Error(res.message || "Creation failed");
          return { type: "create" };
        }
      };

      toast.promise(promise(), {
        loading: "Creating leave request...",
        success: (result) =>
          result.type === "update"
            ? "Leave updated successfully"
            : "Leave request submitted",
        error: (err) => err.message || "Something went wrong",
      });

      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to save teacher leave:", error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Request Leave
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] px-4 py-6 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-background z-10 pb-4">
          <DialogTitle>
            {leave ? "Edit Leave Request" : "New Leave Request"}
          </DialogTitle>
          <DialogDescription>
            {leave
              ? "Update your leave request details."
              : "Fill in the details to request a leave."}
          </DialogDescription>
        </DialogHeader>

        {/* Date Fields - Stack on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Start Date
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              End Date
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Reason */}
        <div className="space-y-2 mb-4">
          <label className="text-sm font-medium text-gray-700">
            Reason for Leave
          </label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason for leave"
            className="resize-none min-h-[100px] border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        {/* Buttons */}
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button onClick={onSubmit} type="submit" className="w-full sm:w-auto">
            {leave ? "Update" : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
