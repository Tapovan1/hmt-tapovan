"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getStudentAbsenceById } from "@/lib/action/student-absence.action";

export function ViewPhotoButton({ absenceId }: { absenceId: string }) {
  const [open, setOpen] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [studentName, setStudentName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleViewPhoto = async () => {
    setLoading(true);
    try {
      const absence = await getStudentAbsenceById(absenceId);
      if (absence) {
        setPhoto(absence.photo || null);
        setStudentName(absence.studentName);
        setOpen(true);
      }
    } catch (error) {
      console.error("Failed to fetch photo:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={handleViewPhoto}
        disabled={loading}
      >
        <Eye className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Student Photo - {studentName}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-4">
            {photo ? (
              <img
                src={photo || "/placeholder.svg"}
                alt={`Photo of ${studentName}`}
                className="max-h-[500px] object-contain rounded-md"
              />
            ) : (
              <div className="flex h-40 w-full items-center justify-center rounded-md border border-dashed">
                <p className="text-sm text-muted-foreground">
                  No photo available
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
