"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DepartmentFilterProps {
  departments: string[];
  paramName?: string;
  path?: string;
}

export function DepartmentFilter({
  departments,
  paramName = "department",
  path = "/ahistory",
}: DepartmentFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleDepartmentChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(paramName);
    } else {
      params.set(paramName, value);
    }
    params.set("page", "1"); // Reset to first page when changing department
    router.push(`${path}?${params.toString()}`);
  };

  return (
    <div className="w-[200px]">
      <Select
        value={searchParams.get(paramName) || "all"}
        onValueChange={handleDepartmentChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Filter by department" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Departments</SelectItem>
          {departments.map((dept) => (
            <SelectItem key={dept} value={dept}>
              {dept}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
