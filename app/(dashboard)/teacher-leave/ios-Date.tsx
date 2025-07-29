"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date?: Date;
  setDate: (date: Date | undefined) => void;
  placeholder?: string;
  forceIOS?: boolean; // Add this for testing
}

// Detect iOS (works for all browsers on iOS)
const isIOS = () => {
  if (typeof window === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
};

export function DatePicker({
  date,
  setDate,
  placeholder,
  forceIOS,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [isIOSDevice, setIsIOSDevice] = React.useState(false);

  React.useEffect(() => {
    const iosDetected = forceIOS || isIOS(); // Use forceIOS for testing
    setIsIOSDevice(iosDetected);

    // Debug info - remove this in production
    console.log("Device Detection:", {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      maxTouchPoints: navigator.maxTouchPoints,
      isIOSDetected: iosDetected,
      forceIOS: forceIOS,
    });
  }, [forceIOS]);

  // Add debug banner (remove in production)
  const showDebug = process.env.NODE_ENV === "development";

  return (
    <div>
      {showDebug && (
        <div className="mb-2 p-2 bg-yellow-100 text-xs rounded">
          <strong>Debug:</strong>{" "}
          {isIOSDevice
            ? "📱 iOS Mode (Native Input)"
            : "🖥️ Desktop Mode (Custom Picker)"}
        </div>
      )}

      {isIOSDevice ? (
        <div className="relative">
          <input
            type="date"
            value={date ? format(date, "yyyy-MM-dd") : ""}
            onChange={(e) => {
              if (e.target.value) {
                setDate(new Date(e.target.value));
              } else {
                setDate(undefined);
              }
            }}
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
              "file:border-0 file:bg-transparent file:text-sm file:font-medium",
              "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              !date && "text-muted-foreground"
            )}
            style={{
              fontSize: "16px", // Prevent iOS zoom
              WebkitAppearance: "none",
              appearance: "none",
            }}
          />
          {!date && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center text-muted-foreground">
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span className="text-sm">{placeholder}</span>
            </div>
          )}
        </div>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>{placeholder}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(selectedDate) => {
                setDate(selectedDate);
                setOpen(false);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
