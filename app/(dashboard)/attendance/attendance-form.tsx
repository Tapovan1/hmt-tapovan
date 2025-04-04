"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { WorkSchedule } from "@/lib/types/work-schedule";
import { isWithinAllowedTime } from "@/lib/isWithinTime";
import {
  markAttendance,
  markCheckOut,
  validateLocation,
} from "@/lib/action/attendance.action";
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
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocationValid, setIsLocationValid] = useState<boolean>(false);

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

  useEffect(() => {
    // Get user's location when component mounts
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const userLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          console.log("user-location", userLocation);

          setLocation(userLocation);
          setLocationError(null);

          // Validate location
          try {
            const validation = await validateLocation(
              userLocation.latitude,
              userLocation.longitude
            );
            setIsLocationValid(validation.success);
            if (!validation.success) {
              setLocationError(validation.message);
            }
          } catch {
            setLocationError("Failed to validate location. Please try again.");
          }
        },
        (error) => {
          setLocationError(
            "Unable to retrieve your location. Please enable location services."
          );
          console.error("Error getting location:", error);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
    }
  }, []);

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
      toast.error(
        "Failed to access camera. Please check your camera permissions."
      );
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
      toast.error("Attendance marking is only allowed during scheduled hours.");
      setLoading(false);
      return;
    }

    if (!location) {
      toast.error("Location is required to mark attendance.");
      setLoading(false);
      return;
    }

    if (!isLocationValid) {
      toast.error("You are not within the allowed location range.");
      setLoading(false);
      return;
    }

    const photo = capturePhoto();
    if (!photo) {
      toast.error("Failed to capture photo. Please try again.");
      setLoading(false);
      return;
    }

    try {
      const data =
        type === "check-in"
          ? await markAttendance({
              photo,
              latitude: location.latitude,
              longitude: location.longitude,
            })
          : await markCheckOut({
              photo,
              latitude: location.latitude,
              longitude: location.longitude,
            });

      if (data.sucess) {
        toast.success(
          type === "check-in"
            ? "Check-in marked successfully!"
            : "Check-out marked successfully!"
        );
        window.location.reload();
      } else {
        toast.error(
          data.message || "Failed to mark attendance. Please try again."
        );
      }
    } catch {
      toast.error("Failed to mark attendance. Please try again.");
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

          {locationError && (
            <p className="mt-4 text-center text-red-500">{locationError}</p>
          )}

          {location && !locationError && (
            <p className="mt-4 text-center text-green-500">
              Location: {location.latitude.toFixed(6)},{" "}
              {location.longitude.toFixed(6)}
            </p>
          )}

          <div className="mt-4 flex justify-center space-x-4">
            {!isRecording ? (
              <Button
                onClick={startCamera}
                disabled={!isAllowedTime || hasCheckedOut || !isLocationValid}
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
                  disabled={loading || !isAllowedTime || !isLocationValid}
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
