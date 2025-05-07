"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const departmentList = [
  "Admin",
  "Computer Operator",
  "Clerk",
  "Primary",
  "SSC",
  "HSC",
  "Foundation",
  "HSC (Ahmd)",
  "GCI",
  "Peon",
  "Security",
  "Guest",
  "Accountant",
];

export function AdminTeacherLeaveFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [name, setName] = useState(searchParams.get("name") || "");
  const [department, setDepartment] = useState(
    searchParams.get("department") || ""
  );
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [startDate, setStartDate] = useState<Date | undefined>(
    searchParams.get("startDate")
      ? new Date(searchParams.get("startDate") as string)
      : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    searchParams.get("endDate")
      ? new Date(searchParams.get("endDate") as string)
      : undefined
  );

  // Apply filters
  const applyFilters = () => {
    const params = new URLSearchParams();

    if (name) params.set("name", name);
    if (department) params.set("department", department);
    if (status) params.set("status", status);
    if (startDate)
      params.set("startDate", startDate.toISOString().split("T")[0]);
    if (endDate) params.set("endDate", endDate.toISOString().split("T")[0]);

    router.push(`/ateacher-leave?${params.toString()}`);
  };

  // Reset filters
  const resetFilters = () => {
    setName("");
    setDepartment("");
    setStatus("");
    setStartDate(undefined);
    setEndDate(undefined);
    router.push("/ateacher-leave");
  };

  // Apply filters when any filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      applyFilters();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [name, department, status, startDate, endDate]);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Name Filter */}

        {/* Department Filter */}
        <Select value={department} onValueChange={setDepartment}>
          <SelectTrigger>
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            {departmentList.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>

        {/* Start Date Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "justify-start text-left font-normal",
                !startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "PPP") : <span>Start Date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* End Date Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "justify-start text-left font-normal",
                !endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "PPP") : <span>End Date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <div className="flex justify-end">
          <Button variant="outline" onClick={resetFilters} className="ml-2">
            Reset Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
