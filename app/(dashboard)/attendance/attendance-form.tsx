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
import ImprovedGeolocation from "./location-accurecy-enhancer";
import LateAttendanceModal from "@/components/late-attendance-model";
import { isAttendanceLate } from "@/utils/attendance-util";

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
  latitude?: number;
  longitude?: number;
  locationRadius?: number;
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
    latitude: number;
    longitude: number;
    accuracy: number;
    isReliable: boolean;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isOnLeave, setIsOnLeave] = useState(false);
  const [leaveMessage, setLeaveMessage] = useState("");
  const [isLocationValid, setIsLocationValid] = useState<boolean>(false);
  const [validationInProgress, setValidationInProgress] = useState(false);

  // Late attendance modal state
  const [showLateModal, setShowLateModal] = useState(false);
  const [lateAttendanceData, setLateAttendanceData] = useState<{
    type: "checkIn" | "checkOut";
    lateMinutes: number;
  } | null>(null);

  const router = useRouter();
  const webcamRef = useRef<Webcam>(null);

  useEffect(() => {
    const checkAllowedTime = () => {
      const isAllowed = isWithinAllowedTime(workSchedule);
      setIsAllowedTime(isAllowed);
    };

    checkAllowedTime();
    const intervalId = setInterval(checkAllowedTime, 60000);
    return () => clearInterval(intervalId);
  }, [workSchedule]);

  const handleLocationUpdate = async (
    newLocation: {
      latitude: number;
      longitude: number;
      accuracy: number;
      isReliable: boolean;
    } | null,
  ) => {
    if (!newLocation) return;
    setLocation(newLocation);

    if ((newLocation.isReliable || !isLocationValid) && !validationInProgress) {
      validateLocationWithServer(newLocation);
    }
  };

  const validateLocationWithServer = async (loc: {
    latitude: number;
    longitude: number;
    accuracy: number;
  }) => {
    try {
      setValidationInProgress(true);
      const validation = await validateLocation(
        loc.accuracy,
        loc.latitude,
        loc.longitude,
      );
      if (validation.isWithinRange) {
        setIsLocationValid(true);
        setLocationError(null);
      } else {
        if (loc.accuracy < 100) {
          setIsLocationValid(false);
          setLocationError(validation.message);
        }
      }
    } catch (error) {
      console.error("Error validating location:", error);
      setLocationError("Error validating your location. Please try again.");
    } finally {
      setValidationInProgress(false);
    }
  };

  const capturePhoto = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      setIsCameraOpen(false);
    }
  };

  const handleSubmit = async (action: "checkIn" | "checkOut") => {
    if (!capturedImage) {
      toast.error("Please capture a photo before submitting.");
      return;
    }
    if (!location) {
      toast.error("Please wait for your location to be detected.");
      return;
    }

    // Check if attendance is late before submitting
    const lateCheck = isAttendanceLate(workSchedule, action);

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("userId", "user_id_here");
    formData.append("action", action);
    formData.append("photo", capturedImage);
    formData.append("latitude", location.latitude.toString());
    formData.append("longitude", location.longitude.toString());
    formData.append("accuracy", location.accuracy.toString());

    if (initialWorkSchedule.id) {
      formData.append("scheduleId", initialWorkSchedule.id);
    }

    try {
      const promise = async () => {
        const res = await markAttendance(formData);
        if (!res.success) throw new Error(res.message || "Attendance failed");
        return res; // keep full result for late check handling
      };

      toast.promise(promise(), {
        loading: "Marking attendance...",
        success: () =>
          `${action === "checkIn" ? "Checked In" : "Checked Out"} successfully!`,
        error: (err) =>
          err.message || "An error occurred while marking attendance",
      });

      setCapturedImage(null);

      // // Show late attendance modal if attendance is late
      // if (lateCheck.isLate) {
      //   setLateAttendanceData({
      //     type: action,
      //     lateMinutes: lateCheck.lateMinutes,
      //   });
      //   setShowLateModal(true);
      // }

      router.refresh();
    } catch (error) {
      toast("An error occurred while marking attendance. Please try again.");
      console.error("Error marking attendance:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
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
                className={`bg-gray-50 border border-gray-200 rounded-xl p-8 flex flex-col justify-center items-center h-48 cursor-pointer hover:bg-gray-100 transition-colors ${
                  !isAllowedTime || !isLocationValid
                    ? "cursor-not-allowed opacity-50"
                    : ""
                }`}
              >
                <Camera className="h-10 w-10 text-gray-400 mb-3" />
                <div className="text-gray-600 font-medium">Take Photo</div>
                <div className="text-gray-500 text-sm mt-1 text-center">
                  {!isLocationValid
                    ? "Please wait for location validation"
                    : !isAllowedTime
                      ? "Outside of allowed check-in hours"
                      : "Click to capture your attendance photo"}
                </div>
              </div>
            )}

            {location && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-600">
                <MapPin className="h-5 w-5 text-[#4285f4]" />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span className="font-medium">
                      {location.latitude.toFixed(6)},{" "}
                      {location.longitude.toFixed(6)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span>Accuracy: ±{Math.round(location.accuracy)}m</span>
                    <span>
                      {location.isReliable
                        ? "✓ Good accuracy"
                        : "Improving accuracy..."}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <ImprovedGeolocation
              onLocationUpdate={handleLocationUpdate}
              targetLocation={
                workSchedule.latitude && workSchedule.longitude
                  ? {
                      latitude: workSchedule.latitude,
                      longitude: workSchedule.longitude,
                    }
                  : undefined
              }
              requiredAccuracy={50}
              maxTime={45000}
              onError={setLocationError}
            />

            {locationError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-100 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                <span>{locationError}</span>
              </div>
            )}

            {isLocationValid && (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-100 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>Location validated successfully</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mt-6">
              <Button
                onClick={() => handleSubmit("checkIn")}
                disabled={
                  !isAllowedTime ||
                  !isLocationValid ||
                  hasCheckedIn ||
                  isSubmitting ||
                  !capturedImage ||
                  !location
                }
                className={`bg-[#4285f4] hover:bg-[#3b78e7] text-white h-12 rounded-lg ${
                  !isAllowedTime ||
                  !isLocationValid ||
                  hasCheckedIn ||
                  isSubmitting ||
                  !capturedImage ||
                  !location
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
                  !isLocationValid ||
                  isSubmitting ||
                  !capturedImage ||
                  !location
                }
                variant="outline"
                className={`border-gray-200 text-gray-700 h-12 rounded-lg ${
                  !isAllowedTime ||
                  !hasCheckedIn ||
                  hasCheckedOut ||
                  !isLocationValid ||
                  isSubmitting ||
                  !capturedImage ||
                  !location
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

      {/* Late Attendance Modal */}
      {showLateModal && lateAttendanceData && (
        <LateAttendanceModal
          isOpen={showLateModal}
          onClose={() => setShowLateModal(false)}
          attendanceType={lateAttendanceData.type}
          lateMinutes={lateAttendanceData.lateMinutes}
        />
      )}
    </>
  );
}
