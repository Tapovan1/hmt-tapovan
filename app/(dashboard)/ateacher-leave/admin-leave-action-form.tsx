"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { updateLeaveStatusWithFeedback } from "@/lib/action/admin-teacher-leave.action";

export function AdminLeaveActionForm({ leaveId }: { leaveId: string }) {
  const router = useRouter();
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAction = async (status: "APPROVED" | "REJECTED") => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("id", leaveId);
      formData.append("status", status);
      formData.append("feedback", feedback);

      const result = await updateLeaveStatusWithFeedback(formData);

      if (result.success) {
        toast("Leave status updated successfully");
        router.refresh();
        router.push("/ateacher-leave");
      } else {
        throw new Error("Failed to update status");
      }
    } catch {
      toast("Failed to update leave status");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Add a note or feedback (optional)"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        className="min-h-[100px]"
      />

      <div className="flex gap-2">
        <Button
          onClick={() => handleAction("APPROVED")}
          className="flex-1"
          disabled={isSubmitting}
        >
          <Check className="h-4 w-4 mr-2" />
          Approve
        </Button>
        <Button
          onClick={() => handleAction("REJECTED")}
          variant="destructive"
          className="flex-1"
          disabled={isSubmitting}
        >
          <X className="h-4 w-4 mr-2" />
          Reject
        </Button>
      </div>
    </div>
  );
}
