"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function DateSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const monthParam = searchParams?.get("month");
  const yearParam = searchParams?.get("year");

  const [month, setMonth] = useState(
    monthParam ? parseInt(monthParam) : currentMonth
  );
  const [year, setYear] = useState(
    yearParam ? parseInt(yearParam) : currentYear
  );

  useEffect(() => {
    const params = new URLSearchParams(searchParams || {});
    params.set("month", month.toString());
    params.set("year", year.toString());
    router.push(`?${params.toString()}`);
  }, [month, year, router, searchParams]);

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

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

  const years = Array.from({ length: 6 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="flex flex-wrap items-center space-x-2 space-y-2 md:space-y-0">
      {/* Previous Button */}
      <Button variant="outline" size="icon" onClick={handlePrevMonth}>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Month Selector */}
      <Select
        value={month.toString()}
        onValueChange={(value) => setMonth(parseInt(value))}
      >
        <SelectTrigger className="w-[120px] md:w-[130px]">
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

      {/* Year Selector */}
      <Select
        value={year.toString()}
        onValueChange={(value) => setYear(parseInt(value))}
      >
        <SelectTrigger className="w-[90px] md:w-[100px]">
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

      {/* Next Button */}
      <Button variant="outline" size="icon" onClick={handleNextMonth}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
