"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter } from "lucide-react"

export function HolidayFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete("type")
    } else {
      params.set("type", value)
    }
    params.set("page", "1") // Reset to first page when filtering
    router.push(`/holidays?${params.toString()}`)
  }

  return (
    <div className="w-full sm:w-[200px]">
      <Select value={searchParams.get("type") || "all"} onValueChange={handleFilterChange}>
        <SelectTrigger className="h-10 border-gray-200 bg-white focus:ring-[#4285f4] focus:border-[#4285f4]">
          <div className="flex items-center">
            <Filter className="h-4 w-4 text-[#4285f4] mr-2" />
            <SelectValue placeholder="Filter by type" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="national">National</SelectItem>
          <SelectItem value="religious">Religious</SelectItem>
          <SelectItem value="school">School</SelectItem>
          <SelectItem value="local">Local</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
