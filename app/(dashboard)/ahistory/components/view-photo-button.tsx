"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Image as ImageIcon, Loader2 } from "lucide-react";
import { getAttendancePhoto } from "@/lib/action/photo.action";
import Image from "next/image";

interface ViewPhotoButtonProps {
  attendanceId: string;
  userName: string;
}

export function ViewPhotoButton({
  attendanceId,
  userName,
}: ViewPhotoButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleViewPhoto = async () => {
    setIsOpen(true);
    setIsLoading(true);
    setError(null);

    try {
      const result = await getAttendancePhoto(attendanceId);
      if (result.success && result.photo) {
        setPhoto(result.photo);
      } else {
        setError("No photo available");
      }
    } catch (err) {
      setError("Failed to load photo");
      console.error("Error loading photo:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleViewPhoto}
        className="h-8 px-3 text-xs font-medium hover:bg-[#4285f4] hover:text-white transition-colors"
      >
        <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
        View Photo
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Attendance Photo - {userName}
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center min-h-[400px] bg-gray-50 rounded-lg">
            {isLoading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-[#4285f4]" />
                <p className="text-sm text-gray-500">Loading photo...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center gap-3 text-gray-500">
                <ImageIcon className="h-12 w-12 text-gray-300" />
                <p className="text-sm">{error}</p>
              </div>
            ) : photo ? (
              <div className="relative w-full h-full">
                <Image
                  src={photo}
                  alt={`Attendance photo for ${userName}`}
                  width={800}
                  height={600}
                  className="rounded-lg object-contain max-h-[500px] w-full"
                  priority
                />
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
