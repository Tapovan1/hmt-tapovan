"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Clock, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LateAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendanceType: "checkIn" | "checkOut";
  lateMinutes: number;
}

export default function LateAttendanceModal({
  isOpen,
  onClose,
  attendanceType,
  lateMinutes,
}: LateAttendanceModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className={`relative w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl transform transition-all duration-300 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-amber-500 to-orange-500 rounded-t-2xl p-6 text-white">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-3 rounded-full">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Late Attendance</h2>
              <p className="text-white/90 text-sm">
                {attendanceType === "checkIn" ? "Check-in" : "Check-out"}{" "}
                recorded
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-center space-x-2 text-amber-600 bg-amber-50 rounded-lg p-3">
            <Clock className="h-5 w-5" />
            <span className="font-medium">
              {lateMinutes} minute{lateMinutes !== 1 ? "s" : ""} late
            </span>
          </div>

          <div className="text-center space-y-3">
            <p className="text-gray-700 font-medium">
              You marked today's attendance as late.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              Please try to mark your attendance on time to maintain good
              attendance records.
            </p>
          </div>

          {/* Action buttons */}
          <div className="space-y-3 pt-2">
            <Button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
            >
              I Understand
            </Button>

            <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
              <Phone className="h-4 w-4" />
              <span>Need help? Contact your team lead</span>
            </div>
          </div>
        </div>

        {/* Bottom accent */}
        <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-b-2xl"></div>
      </div>
    </div>
  );
}
