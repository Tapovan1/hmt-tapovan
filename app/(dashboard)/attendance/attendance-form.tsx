"use client";

import { useState, useRef, useEffect } from "react";
import {
  Camera,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import {
  markAttendance,
  validateLocation,
} from "@/lib/action/attendance.action";
import Webcam from "react-webcam";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { isWithinAllowedTime } from "@/lib/isWithinTime";
import { formatTimeTo12Hour } from "@/lib/utils/date-format";
import { Button } from "@/components/ui/button";

interface WorkSchedule {
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
  const [isLocationValid, setIsLocationValid] = useState<boolean>(false);

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

              if (validation.isWithinRange) {
                setIsLocationValid(true);
              } else {
                setIsLocationValid(false);
              }

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
        setCapturedImage(null);
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

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-800">
        Mark Your Attendance
      </h2>

      {isCameraOpen ? (
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-xl border border-gray-200">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full"
            />
          </div>
          <div className="flex justify-center space-x-3">
            <Button
              onClick={capturePhoto}
              className="bg-[#4285f4] hover:bg-[#3b78e7] text-white"
            >
              Capture Photo
            </Button>
            <Button
              onClick={() => setIsCameraOpen(false)}
              variant="outline"
              className="border-gray-200"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {capturedImage ? (
            <div className="relative overflow-hidden rounded-xl border border-gray-200">
              <img
                src={capturedImage || "/placeholder.svg"}
                alt="Captured"
                className="w-full h-auto"
              />
              <Button
                disabled={!isAllowedTime}
                className="absolute top-3 right-3 bg-white hover:bg-gray-100 text-gray-700 p-2 rounded-md shadow-sm"
                onClick={() => setCapturedImage(null)}
                variant="ghost"
                size="sm"
              >
                Retake
              </Button>
            </div>
          ) : (
            <div
              onClick={() =>
                isLocationValid && isAllowedTime && setIsCameraOpen(true)
              }
              className={`bg-gray-50 border border-gray-200 rounded-xl p-8 flex flex-col justify-center items-center h-20 cursor-pointer hover:bg-gray-100 transition-colors ${
                !isAllowedTime || !isLocationValid
                  ? "cursor-not-allowed opacity-50"
                  : ""
              }`}
            >
              <Camera className="h-10 w-10 text-gray-400 mb-3" />
              <div className="text-gray-600 font-medium">Take Photo</div>
              <div className="text-gray-500 text-sm mt-1">
                Click to capture your attendance photo
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-600">
            <MapPin className="h-5 w-5 text-[#4285f4]" />
            <span>
              Location: {location.latitude?.toFixed(6) || "..."},{" "}
              {location.longitude?.toFixed(6) || "..."}
            </span>
          </div>

          {locationError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-100 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span>{locationError}</span>
            </div>
          )}

          {!locationError && location.latitude && location.longitude && (
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-100 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span>
                Location detected successfully
                {loading && (
                  <span className="ml-2">(Improving accuracy...)</span>
                )}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mt-6">
            <Button
              onClick={() => handleSubmit("checkIn")}
              disabled={
                !isAllowedTime ||
                loading ||
                hasCheckedIn ||
                isSubmitting ||
                !capturedImage ||
                !location.latitude
              }
              className={`bg-[#4285f4] hover:bg-[#3b78e7] text-white h-12 rounded-lg ${
                loading ||
                !isAllowedTime ||
                hasCheckedIn ||
                isSubmitting ||
                !capturedImage ||
                !location.latitude
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {isSubmitting ? "Processing..." : "Check In"}
            </Button>
            <Button
              onClick={() => handleSubmit("checkOut")}
              disabled={
                !isAllowedTime ||
                !hasCheckedIn ||
                hasCheckedOut ||
                isSubmitting ||
                !capturedImage ||
                !location.latitude
              }
              variant="outline"
              className={`border-gray-200 text-gray-700 h-12 rounded-lg ${
                !hasCheckedIn ||
                hasCheckedOut ||
                isSubmitting ||
                !capturedImage ||
                !location.latitude
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {isSubmitting ? "Processing..." : "Check Out"}
            </Button>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-sm text-gray-600 mb-2 font-medium flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#4285f4]" />
          Attendance marking is only allowed during scheduled hours:
        </div>
        <div className="text-sm text-gray-600 pl-6">
          <div className="flex justify-between">
            <span>Weekdays:</span>
            <span className="font-medium">
              {formatTimeTo12Hour(workSchedule.startTime)} -{" "}
              {formatTimeTo12Hour(workSchedule.endTime)}
            </span>
          </div>
          {workSchedule.saturdayStartTime && (
            <div className="flex justify-between mt-1">
              <span>Saturdays:</span>
              <span className="font-medium">
                {formatTimeTo12Hour(workSchedule.saturdayStartTime)} -{" "}
                {formatTimeTo12Hour(workSchedule.saturdayEndTime || "")}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
