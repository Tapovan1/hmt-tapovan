"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react";

export default function DateSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const [month, setMonth] = useState(
    searchParams.get("month") ? Number(searchParams.get("month")) : currentMonth
  );
  const [year, setYear] = useState(
    searchParams.get("year") ? Number(searchParams.get("year")) : currentYear
  );

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const updateUrl = (newMonth: number, newYear: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("month", newMonth.toString());
    params.set("year", newYear.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleMonthChange = (value: string) => {
    const newMonth = Number.parseInt(value);
    setMonth(newMonth);
    updateUrl(newMonth, year);
  };

  const handleYearChange = (value: string) => {
    const newYear = Number.parseInt(value);
    setYear(newYear);
    updateUrl(month, newYear);
  };

  const handlePrevMonth = () => {
    let newMonth = month - 1;
    let newYear = year;

    if (newMonth < 1) {
      newMonth = 12;
      newYear = year - 1;
    }

    setMonth(newMonth);
    setYear(newYear);
    updateUrl(newMonth, newYear);
  };

  const handleNextMonth = () => {
    let newMonth = month + 1;
    let newYear = year;

    if (newMonth > 12) {
      newMonth = 1;
      newYear = year + 1;
    }

    setMonth(newMonth);
    setYear(newYear);
    updateUrl(newMonth, newYear);
  };

  return (
    <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrevMonth}
        className="h-8 w-8 border-gray-200"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous month</span>
      </Button>

      <div className="flex items-center space-x-1">
        <CalendarIcon className="h-4 w-4 text-[#4285f4] mr-1" />

        <Select value={month.toString()} onValueChange={handleMonthChange}>
          <SelectTrigger className="h-8 w-[110px] border-gray-200 bg-white">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value.toString()}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={year.toString()} onValueChange={handleYearChange}>
          <SelectTrigger className="h-8 w-[90px] border-gray-200 bg-white">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={handleNextMonth}
        className="h-8 w-8 border-gray-200"
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next month</span>
      </Button>
    </div>
  );
}
