"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2 } from "lucide-react";

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
    params.set("page", "1");
    router.push(`${path}?${params.toString()}`);
  };

  return (
    <div className="w-full sm:w-[240px]">
      <Select
        value={searchParams.get(paramName) || "all"}
        onValueChange={handleDepartmentChange}
      >
        <SelectTrigger className="h-10 border-gray-200 bg-white focus:ring-[#4285f4] focus:border-[#4285f4]">
          <div className="flex items-center">
            <Building2 className="h-4 w-4 text-[#4285f4] mr-2" />
            <SelectValue placeholder="Filter by department" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="font-medium">
            All Departments
          </SelectItem>
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
