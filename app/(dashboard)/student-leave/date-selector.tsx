"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { DatePicker } from "@/components/date-picker";
import { Calendar } from "lucide-react";

interface DateSelectorProps {
  initialDate?: string;
}

export function DateSelector({ initialDate }: DateSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [startDate, setStartDate] = useState<Date | undefined>(
    initialDate ? new Date(initialDate) : undefined
  );

  useEffect(() => {
    if (!startDate) return;

    // Adjust selected date
    const adjustedStartDate = new Date(startDate);
    adjustedStartDate.setDate(adjustedStartDate.getDate() + 1);
    adjustedStartDate.setHours(0, 0, 0, 0);

    const params = new URLSearchParams(searchParams.toString());

    // Format adjusted date as YYYY-MM-DD
    const formattedDate = adjustedStartDate.toISOString().split("T")[0];

    params.set("date", formattedDate);

    // Push the new URL
    router.push(`${pathname}?${params.toString()}`);
  }, [startDate]);

  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-gray-600" />
      <span className="text-sm font-medium text-gray-600">Select Date:</span>
      <DatePicker
        date={startDate}
        setDate={setStartDate}
        placeholder="Select start date"
        className="h-10 border-gray-200 focus:ring-[#4285f4] focus:border-[#4285f4]"
      />
    </div>
  );
}
