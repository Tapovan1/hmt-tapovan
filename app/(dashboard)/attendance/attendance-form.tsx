"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { WorkSchedule } from "@/lib/types/work-schedule";
import { isWithinAllowedTime } from "@/lib/isWithinTime";
import { markAttendance, markCheckOut } from "@/lib/action/attendance.action";
import { toast } from "sonner";
import { formatTimeTo12Hour } from "@/lib/utils/date-format";

interface AttendanceFormProps {
  initialWorkSchedule: WorkSchedule;
  hasCheckedIn: boolean;
  hasCheckedOut: boolean;
}

export default function AttendanceForm({
  initialWorkSchedule,
  hasCheckedIn,
  hasCheckedOut,
}: AttendanceFormProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [workSchedule] = useState<WorkSchedule>(initialWorkSchedule);
  const [isAllowedTime, setIsAllowedTime] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAllowedTime = () => {
      const isAllowed = isWithinAllowedTime(workSchedule);
      setIsAllowedTime(isAllowed);
    };

    // Check immediately and then every minute
    checkAllowedTime();
    const intervalId = setInterval(checkAllowedTime, 60000);

    return () => clearInterval(intervalId);
  }, [workSchedule]);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current
          .play()
          .catch((e) => console.error("Error playing video:", e));
      }
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsRecording(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return null;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const context = canvas.getContext("2d");
    if (!context) return null;

    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg");
  };

  const handleAttendance = async (type: "check-in" | "check-out") => {
    setLoading(true);
    if (!isAllowedTime) {
      toast("Attendance marking is only allowed during scheduled hours.");
      setLoading(false);
      return;
    }

    const photo = capturePhoto();
    if (!photo) {
      toast("Failed to capture photo. Please try again.", {
        description: "Failed to capture photo. Please try again.",
      });
      setLoading(false);
      return;
    }

    try {
      const data =
        type === "check-in"
          ? await markAttendance({ photo })
          : await markCheckOut({ photo });

      if (data.sucess) {
        toast(
          type === "check-in"
            ? "Check-in marked successfully!"
            : "Check-out marked successfully!"
        );
        window.location.reload(); // Refresh to update status
      } else {
        toast(data.message || "Failed to mark attendance. Please try again.");
      }
    } catch {
      toast("Failed to mark attendance. Please try again.");
    } finally {
      stopCamera();
      setLoading(false);
    }
  };

  if (hasCheckedOut) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-green-600 font-semibold">
            You have completed your attendance for today!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <Card>
        <CardContent className="p-6">
          <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
            {isRecording ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <Camera className="h-12 w-12" />
              </div>
            )}
          </div>
          <div className="mt-4 flex justify-center space-x-4">
            {!isRecording ? (
              <Button
                onClick={startCamera}
                disabled={!isAllowedTime || hasCheckedOut}
              >
                Start Camera
              </Button>
            ) : (
              <>
                <Button variant="destructive" onClick={stopCamera}>
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    handleAttendance(hasCheckedIn ? "check-out" : "check-in")
                  }
                  disabled={loading || !isAllowedTime}
                >
                  {loading
                    ? "Loading..."
                    : hasCheckedIn
                    ? "Check Out"
                    : "Check In"}
                </Button>
              </>
            )}
          </div>
          {!isAllowedTime && (
            <p className="mt-4 text-center text-red-500">
              Attendance marking is only allowed during scheduled hours:
              <br />
              Weekdays: {formatTimeTo12Hour(workSchedule.startTime)} -{" "}
              {formatTimeTo12Hour(workSchedule.endTime)}
              {workSchedule.saturdayStartTime && (
                <>
                  <br />
                  Saturdays:{" "}
                  {workSchedule.saturdayStartTime &&
                    formatTimeTo12Hour(workSchedule.saturdayStartTime)}{" "}
                  -{" "}
                  {workSchedule.saturdayEndTime &&
                    formatTimeTo12Hour(workSchedule.saturdayEndTime)}
                </>
              )}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
