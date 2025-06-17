"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, X, Filter } from "lucide-react"

interface DepartmentFilterProps {
  departments: string[]
  paramName?: string
  path?: string
}

export function DepartmentFilter({ departments, paramName = "department", path = "/employee" }: DepartmentFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentDepartment = searchParams.get(paramName)

  const handleDepartmentChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete(paramName)
    } else {
      params.set(paramName, value)
    }

    router.push(`${path}?${params.toString()}`)
  }

  const clearFilter = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete(paramName)
    router.push(`${path}?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2 w-full sm:w-auto">
      <div className="relative flex-1 sm:w-[240px]">
        <Select value={currentDepartment || "all"} onValueChange={handleDepartmentChange}>
          <SelectTrigger className="h-10 border-slate-200 bg-white hover:bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <div className="bg-blue-100 p-1.5 rounded-md mr-2">
                  <Building2 className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <SelectValue placeholder="Filter by department" />
              </div>
              {currentDepartment && (
                <Badge variant="secondary" className="ml-2 h-5 px-2 text-xs bg-blue-100 text-blue-700 border-0">
                  Active
                </Badge>
              )}
            </div>
          </SelectTrigger>
          <SelectContent className="w-[240px]">
            <div className="p-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Filter className="h-4 w-4" />
                Department Filter
              </div>
            </div>

            <SelectItem value="all" className="font-medium hover:bg-slate-50 focus:bg-slate-50">
              <div className="flex items-center justify-between w-full">
                <span>All Departments</span>
                {!currentDepartment && (
                  <Badge variant="outline" className="ml-2 h-5 px-2 text-xs">
                    {departments.length} total
                  </Badge>
                )}
              </div>
            </SelectItem>

            {departments.map((dept) => (
              <SelectItem key={dept} value={dept} className="hover:bg-slate-50 focus:bg-slate-50">
                <div className="flex items-center justify-between w-full">
                  <span>{dept}</span>
                  {currentDepartment === dept && (
                    <Badge variant="secondary" className="ml-2 h-5 px-2 text-xs bg-blue-100 text-blue-700 border-0">
                      Selected
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filter Button */}
      {currentDepartment && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilter}
          className="h-10 px-3 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm"
          title="Clear department filter"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear filter</span>
        </Button>
      )}
    </div>
  )
}
