"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  updateStudentAbsence,
  getStudentAbsenceById,
} from "@/lib/action/student-absence.action";
import { useRouter } from "next/navigation";

export function ConfirmStatusButton({
  absenceId,
  currentStatus,
}: {
  absenceId: string;
  currentStatus: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
        parentName: absence.parentName,
        reason: absence.purpose,
        status: "DONE",
      });

      toast.success("Student leave confirmed successfully");
      router.refresh();
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
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
      className={
        currentStatus === "DONE"
          ? "border-green-200 text-green-600"
          : "bg-[#4285f4] hover:bg-[#3b78e7]"
      }
    >
      <Check className="h-4 w-4" />
    </Button>
  );
}
