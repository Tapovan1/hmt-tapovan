"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  markAttendance,
  validateLocation,
} from "@/lib/action/attendance.action";
import { Camera, Clock, MapPin } from "lucide-react";

import Webcam from "react-webcam";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { isWithinAllowedTime } from "@/lib/isWithinTime";
import { formatTimeTo12Hour } from "@/lib/utils/date-format";

interface WorkSchedule {
  name: string;
  department: string;
  startTime: string;
  endTime: string;
  workDays: number[];
  graceMinutes: number;
  saturdayStartTime?: string;
  saturdayEndTime?: string;
  saturdayGraceMinutes?: number;
  id?: string;
}

export default function AttendanceForm({
  initialWorkSchedule,
  hasCheckedIn,
  hasCheckedOut,
}: {
  initialWorkSchedule: WorkSchedule;
  hasCheckedIn: boolean;
  hasCheckedOut: boolean;
}) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [workSchedule] = useState<WorkSchedule>(initialWorkSchedule);
  const [isAllowedTime, setIsAllowedTime] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState<{
    latitude: number | null;
    longitude: number | null;
  }>({ latitude: null, longitude: null });
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isOnLeave, setIsOnLeave] = useState(false);
  const [leaveMessage, setLeaveMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const webcamRef = useRef<Webcam>(null);

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
    // Get user's location when component mounts
    let isMounted = true;
    let watchId: number | null = null;

    const getAndValidateLocation = async () => {
      if (navigator.geolocation) {
        try {
          // First set the component state to loading
          setLoading(true);
          setLocationError(null);

          // Use watchPosition instead of getCurrentPosition for continuous updates
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              if (!isMounted) return;

              const userLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              };

              // Add accuracy information
              const accuracy = position.coords.accuracy; // in meters

              console.log("user-location", userLocation, "accuracy:", accuracy);

              setLocation(userLocation);

              // Validate location
              const validation = await validateLocation(
                accuracy,
                userLocation.latitude,
                userLocation.longitude
              );

              if (!isMounted) return;

              if (!validation.success) {
                setLocationError(validation.message);
              } else {
                // If location is valid, we can stop watching
                if (watchId !== null) {
                  navigator.geolocation.clearWatch(watchId);
                  watchId = null;
                }
              }

              setLoading(false);
            },
            (error) => {
              if (!isMounted) return;

              let errorMsg = "Unable to retrieve your location.";
              switch (error.code) {
                case error.PERMISSION_DENIED:
                  errorMsg =
                    "Location access denied. Please enable location services.";
                  break;
                case error.POSITION_UNAVAILABLE:
                  errorMsg = "Location information is unavailable.";
                  break;
                case error.TIMEOUT:
                  errorMsg = "Location request timed out.";
                  break;
              }

              setLocationError(errorMsg);
              console.error("Error getting location:", error);
              setLoading(false);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0,
            }
          );
        } catch (error) {
          if (!isMounted) return;
          setLocationError(
            "Unable to retrieve your location. Please enable location services."
          );
          console.error("Error getting location:", error);
          setLoading(false);
        }
      } else {
        if (!isMounted) return;
        setLocationError("Geolocation is not supported by your browser.");
        setLoading(false);
      }
    };

    getAndValidateLocation();

    return () => {
      isMounted = false;
      // Clear the watch when component unmounts
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  const capturePhoto = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      setIsCameraOpen(false);
    }
  };

  const handleSubmit = async (action: "checkIn" | "checkOut") => {
    setLoading(true);
    if (!capturedImage) {
      toast("Please capture a photo before submitting.");
      return;
    }

    if (!location.latitude || !location.longitude) {
      toast("Please wait for your location to be detected.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("userId", "user_id_here"); // Replace with actual user ID
    formData.append("action", action);
    formData.append("photo", capturedImage);
    formData.append("latitude", location.latitude.toString());
    formData.append("longitude", location.longitude.toString());
    if (initialWorkSchedule.id) {
      formData.append("scheduleId", initialWorkSchedule.id);
    }

    try {
      const result = await markAttendance(formData);

      if (result.success) {
        toast(
          `${action === "checkIn" ? "Checked In" : "Checked Out"} successfully!`
        );
        setLoading(false);
        router.refresh();

        // Refresh the page to update the UI
      } else {
        // Check if the error is due to being on leave
        if (result.isOnLeave) {
          setIsOnLeave(true);
          setLeaveMessage(result.error);
        } else {
          toast(
            "An error occurred while marking attendance. Please try again."
          );
        }
      }
    } catch (error) {
      toast("An error occurred while marking attendance. Please try again.");
      console.error("Error marking attendance:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If the user is on leave, show a message instead of the form
  if (isOnLeave) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>On Approved Leave</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="text-amber-500 mb-4">
              <Clock className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-lg font-medium mb-2">
              You are on approved leave today
            </p>
            <p className="text-muted-foreground">{leaveMessage}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mark Your Attendance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isCameraOpen ? (
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-lg border">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full"
                />
              </div>
              <div className="flex justify-center space-x-2">
                <Button onClick={capturePhoto}>Capture Photo</Button>
                <Button
                  variant="outline"
                  onClick={() => setIsCameraOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {capturedImage ? (
                <div className="relative overflow-hidden rounded-lg border">
                  <img
                    src={capturedImage || "/placeholder.svg"}
                    alt="Captured"
                    className="w-full h-auto"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setCapturedImage(null)}
                  >
                    Retake
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setIsCameraOpen(true)}
                  className="w-full py-8"
                  variant="outline"
                >
                  <Camera className="mr-2 h-5 w-5" />
                  Take Photo
                </Button>
              )}
              {location && (
                <div className="text-sm text-muted-foreground">
                  <MapPin className="inline-block mr-1 h-4 w-4" />
                  {`Location: ${location.latitude?.toFixed(
                    6
                  )}, ${location.longitude?.toFixed(6)}`}
                </div>
              )}

              {locationError ? (
                <div className="text-red-500 text-sm p-2 bg-red-50 rounded-md">
                  <MapPin className="inline-block mr-1 h-4 w-4" />
                  {locationError}
                </div>
              ) : location.latitude && location.longitude ? (
                <div className="text-green-600 text-sm p-2 bg-green-50 rounded-md">
                  <MapPin className="inline-block mr-1 h-4 w-4" />
                  Location detected successfully
                  {loading && (
                    <span className="ml-2">(Improving accuracy...)</span>
                  )}
                </div>
              ) : (
                <div className="text-amber-500 text-sm p-2 bg-amber-50 rounded-md">
                  <MapPin className="inline-block mr-1 h-4 w-4" />
                  Detecting your location...
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mt-4">
                <Button
                  onClick={() => handleSubmit("checkIn")}
                  disabled={
                    loading ||
                    hasCheckedIn ||
                    isSubmitting ||
                    !capturedImage ||
                    !location.latitude
                  }
                  className="w-full"
                >
                  {isSubmitting ? "Processing..." : "Check In"}
                </Button>
                <Button
                  onClick={() => handleSubmit("checkOut")}
                  disabled={
                    !hasCheckedIn ||
                    hasCheckedOut ||
                    isSubmitting ||
                    !capturedImage ||
                    !location.latitude
                  }
                  className="w-full"
                  variant="secondary"
                >
                  {isSubmitting ? "Processing..." : "Check Out"}
                </Button>
              </div>
            </div>
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
  );
}
