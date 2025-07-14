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
import { toast } from "sonner";

export function ViewPhotoButton({ absenceId }: { absenceId: string }) {
  const [open, setOpen] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [studentName, setStudentName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleViewPhoto = async () => {
    setLoading(true);
    try {
      const photo = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}${absenceId}`
      );
      setPhoto(photo.url);
      setOpen(true);
      console.log("Photo URL:", photo.url);

      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch photo:", error);
      toast.error("Failed to load student photo");
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
        className="border-gray-200 text-gray-600 hover:text-[#4285f4]"
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
              <div className="flex h-40 w-full items-center justify-center rounded-md border border-dashed border-gray-200">
                <p className="text-sm text-gray-500">No photo available</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
