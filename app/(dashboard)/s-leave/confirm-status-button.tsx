"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  updateStudentAbsence,
  getStudentAbsenceById,
} from "@/lib/action/student-absence.action";

export function ConfirmStatusButton({
  absenceId,
  currentStatus,
}: {
  absenceId: string;
  currentStatus: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (currentStatus === "DONE") {
      toast("Already confirmed");

      return;
    }

    setLoading(true);
    try {
      // First get the current data
      const absence = await getStudentAbsenceById(absenceId);

      if (!absence) {
        throw new Error("Absence record not found");
      }

      // Update with the current data plus the new status and outTime
      await updateStudentAbsence({
        id: absenceId,
        rollNo: absence.rollNo,
        studentName: absence.studentName,
        class: absence.class,
        standard: absence.standard,
        parentName: absence.parentName,
        reason: absence.purpose,
        status: "DONE",
        photo: absence.photo || undefined,
      });

      toast("Status updated");

      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error("Failed to update status:", error);
      toast("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={currentStatus === "DONE" ? "outline" : "default"}
      size="icon"
      onClick={handleConfirm}
      disabled={loading || currentStatus === "DONE"}
    >
      <Check className="h-4 w-4" />
    </Button>
  );
}
