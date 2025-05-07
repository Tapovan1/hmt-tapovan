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

import { Textarea } from "@/components/ui/textarea";

import { Plus } from "lucide-react";

import {
  createTeacherLeave,
  updateTeacherLeave,
} from "@/lib/action/teacherLeave.action";
import { DatePicker } from "@/components/date-picker";

export function TeacherLeaveDialog({
  children,
  leave,
}: {
  children?: React.ReactNode;
  leave?: any;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [reason, setReason] = useState(leave?.reason || "");

  async function onSubmit() {
    if (!startDate || !endDate) {
      return;
    }
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
      if (data.id) {
        await updateTeacherLeave(data);
      } else {
        await createTeacherLeave(data);
      }
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
      <DialogContent className="sm:max-w-[600px] p-0 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="p-4 sm:p-0 sticky top-0 bg-background z-10">
          <DialogTitle>
            {leave ? "Edit Leave Request" : "New Leave Request"}
          </DialogTitle>
          <DialogDescription>
            {leave
              ? "Update your leave request details."
              : "Fill in the details to request a leave."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DatePicker
            date={startDate}
            setDate={setStartDate}
            placeholder="Start Date"
          />
          <DatePicker
            date={endDate}
            setDate={setEndDate}
            placeholder="End Date"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Reason for Leave</label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason for leave"
            className="resize-none min-h-[100px]"
          />
        </div>

        <DialogFooter className="pt-4 sm:pt-0 flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            type="submit"
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            {leave ? "Update" : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
