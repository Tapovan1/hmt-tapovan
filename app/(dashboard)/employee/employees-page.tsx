"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Search } from "lucide-react";
import EmploteeDialog from "@/components/Dashboard/EmployeeDialog";
import Delete from "./Delete";
import EditEmployeeDialog from "@/components/Dashboard/EditEmployeeDialog";
import { DepartmentFilter } from "./department-filter";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { departmentList } from "@/lib/departments";

// const departmentList = [
//   "Admin",
//   "Computer Operator",
//   "Clerk",
//   "Primary",
//   "SSC",
//   "HSC",
//   "Foundation",
//   "HSC (Ahmd)",
//   "GCI",
//   "Peon",
//   "Security",
//   "Guest",
//   "Accountant",
// ];

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  salary: number;
}

interface EmployeesPageProps {
  employees: Employee[];
}

export default function EmployeesPage({ employees }: EmployeesPageProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter employees based on search term
  const filteredEmployees = useMemo(() => {
    if (!searchTerm.trim()) {
      return employees;
    }

    return employees.filter((employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-[#e6eef8] p-2.5 rounded-full">
            <Users className="h-5 w-5 text-[#4285f4]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Manage Employee Data
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[140px]">
            <DepartmentFilter departments={departmentList} />
          </div>
          <div className="flex-shrink-0">
            <EmploteeDialog />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search employees by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4285f4] focus:border-transparent"
          />
        </div>
        {searchTerm && (
          <p className="text-sm text-gray-500 mt-2">
            Found {filteredEmployees.length} employee
            {filteredEmployees.length !== 1 ? "s" : ""} matching &quot;
            {searchTerm}&quot;
          </p>
        )}
      </div>

      <div className="bg-[#4285f4] rounded-t-sm shadow-sm text-white py-3 px-6 font-medium">
        Monthly Attendance Records
      </div>

      {/* Employee Table */}
      <Card className="bg-white overflow-hidden rounded-none">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-gray-200">
                <TableHead className="font-medium text-center text-gray-700 py-3">
                  Employee
                </TableHead>
                <TableHead className="font-medium text-center text-gray-700 py-3">
                  Department
                </TableHead>
                <TableHead className="font-medium text-center text-gray-700 py-3">
                  Role
                </TableHead>
                <TableHead className="font-medium text-center text-gray-700 py-3">
                  Email
                </TableHead>
                <TableHead className="font-medium text-center text-gray-700 py-3">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    <div className="flex flex-col items-center justify-center text-center">
                      <Users className="h-10 w-10 text-gray-300 mb-2" />
                      <p className="text-gray-500">
                        {searchTerm
                          ? `No employees found matching "${searchTerm}"`
                          : "No employees found"}
                      </p>
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm("")}
                          className="text-[#4285f4] hover:underline text-sm mt-1"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee) => (
                  <TableRow
                    key={employee.id}
                    className="hover:bg-gray-50/50 border-b border-gray-100"
                  >
                    <TableCell className="py-2.5 flex items-center justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="text-[#4285f4] hover:text-[#3b78e7] hover:bg-[#e6eef8]"
                      >
                        <Link href={`/employee/${employee.id}`}>
                          {employee.name.toUpperCase()}
                        </Link>
                      </Button>
                    </TableCell>
                    <TableCell className="py-2.5">
                      <div className="flex items-center justify-center gap-3">
                        <Badge
                          variant="outline"
                          className="bg-gray-50 text-gray-700 font-normal"
                        >
                          {employee.department}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="py-2.5">
                      <div className="flex items-center justify-center gap-3">
                        <RoleBadge role={employee.role} />
                      </div>
                    </TableCell>
                    <TableCell className="py-2.5 text-center text-gray-600">
                      {employee.email}
                    </TableCell>
                    <TableCell className="py-2.5 text-right">
                      <div className="flex justify-center gap-1">
                        <EditEmployeeDialog employee={employee} />
                        <Delete id={employee.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  switch (role) {
    case "ADMIN":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 font-normal">
          Admin
        </Badge>
      );
    case "SUPERADMIN":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 font-normal">
          Super Admin
        </Badge>
      );
    case "TEACHER":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 font-normal">
          Teacher
        </Badge>
      );
    case "TEACHERE":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 font-normal">
          TeacherE
        </Badge>
      );
    case "SECURITY":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 font-normal">
          Security
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-gray-600 font-normal">
          {role}
        </Badge>
      );
  }
}
