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
import { DatePicker } from "./ios-Date";

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

  // Add this for testing
  const [forceIOSMode, setForceIOSMode] = useState(false);

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
        // await updateTeacherLeave(data);
      } else {
        // await createTeacherLeave(data);
      }
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to save teacher leave:", error);
    }
  }

  const showDebug = process.env.NODE_ENV === "development";

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
      <DialogContent
        className="sm:max-w-[600px] px-4 py-6 sm:p-6"
        // Remove max-height and overflow for iOS compatibility
        style={{
          maxHeight: "85vh", // Reduced for iOS
          overflowY: "auto",
          fontSize: "16px", // Prevent iOS zoom
          WebkitOverflowScrolling: "touch", // Smooth scrolling on iOS
        }}
        onOpenAutoFocus={(e) => {
          // Prevent auto-focus issues on iOS
          if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader className="pb-4">
          <DialogTitle>
            {leave ? "Edit Leave Request" : "New Leave Request"}
          </DialogTitle>
          <DialogDescription>
            {leave
              ? "Update your leave request details."
              : "Fill in the details to request a leave."}
          </DialogDescription>
        </DialogHeader>

        {/* Add debug controls */}
        {showDebug && (
          <div className="mb-4 p-3 bg-gray-100 rounded">
            <p className="text-sm font-medium mb-2">🧪 Test Mode:</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setForceIOSMode(!forceIOSMode)}
            >
              {forceIOSMode ? "📱 iOS Mode ON" : "🖥️ Desktop Mode"}
            </Button>
          </div>
        )}

        {/* Date Fields - Stack on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <DatePicker
            date={startDate}
            setDate={setStartDate}
            placeholder="Start Date"
            forceIOS={forceIOSMode}
          />
          <DatePicker
            date={endDate}
            setDate={setEndDate}
            placeholder="End Date"
            forceIOS={forceIOSMode}
          />
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
            className="resize-none min-h-[100px]"
            // Prevent iOS zoom
            style={{
              fontSize: "16px", // Prevent iOS zoom
              WebkitAppearance: "none", // Remove iOS styling
            }}
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
