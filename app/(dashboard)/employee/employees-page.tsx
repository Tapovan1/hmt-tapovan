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
import { Users, Search, AlertCircle } from "lucide-react";
import EmploteeDialog from "@/components/Dashboard/EmployeeDialog";
import Delete from "./Delete";
import EditEmployeeDialog from "@/components/Dashboard/EditEmployeeDialog";
import { DepartmentFilter } from "./department-filter";
import Link from "next/link";
import { departmentList } from "@/lib/departments";
import ExportEmployeesButton from "@/components/Dashboard/ExportEmployeesButton";

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
  status: string;
  department: string;
  catagory: string;
  salary: number;
  hasProfile: boolean;
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

      {/* Info Banner */}
      <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Profile Status Indicator:</span> Employees with a{" "}
            <span className="inline-flex items-center gap-1">
              <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              red dot
            </span>{" "}
            before their name have not submitted their profile yet.
          </p>
        </div>
      </div>

      {/* Search Bar and Export Button */}
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search employees by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4285f4] focus:border-transparent w-full"
            />
          </div>
          <div className="flex-shrink-0">
            <ExportEmployeesButton />
          </div>
        </div>
        {searchTerm && (
          <p className="text-sm text-gray-500 mt-2">
            Found {filteredEmployees.length} employee
            {filteredEmployees.length !== 1 ? "s" : ""} matching &quot;
            {searchTerm}&quot;
          </p>
        )}
      </div>

      {/* Employee Table */}
      <Card className="bg-white overflow-hidden rounded-xl shadow-lg border-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-[#4285f4] to-[#5a9ff7] hover:from-[#4285f4] hover:to-[#5a9ff7] border-0">
                <TableHead className="font-semibold text-white py-4 text-center">
                  Employee
                </TableHead>
                <TableHead className="font-semibold text-white py-4 text-center">
                  Email
                </TableHead>
                <TableHead className="font-semibold text-white py-4 text-center">
                  Department
                </TableHead>
                <TableHead className="font-semibold text-white py-4 text-center">
                  Role
                </TableHead>
                <TableHead className="font-semibold text-white py-4 text-center">
                  Status
                </TableHead>
                <TableHead className="font-semibold text-white py-4 text-center">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-center">
                      <Users className="h-16 w-16 text-gray-300 mb-4" />
                      <p className="text-gray-500 text-lg mb-2">
                        {searchTerm
                          ? `No employees found matching "${searchTerm}"`
                          : "No employees found"}
                      </p>
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm("")}
                          className="text-[#4285f4] hover:underline text-sm mt-2 font-medium"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee, index) => (
                  <TableRow
                    key={employee.id}
                    className={`
                      hover:bg-blue-50/50 transition-all duration-200 border-b border-gray-100
                      ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}
                    `}
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center justify-center gap-2">
                        {!employee.hasProfile && (
                          <div
                            className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-md"
                            title="Profile not submitted"
                          />
                        )}
                        <Link
                          href={`/employee/${employee.id}`}
                          className="text-[#4285f4] hover:text-[#3b78e7] font-semibold hover:underline transition-colors"
                        >
                          {employee.name.toUpperCase()}
                        </Link>
                      </div>
                    </TableCell>
                    
                    <TableCell className="py-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <svg className="w-3 h-3 text-[#4285f4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-600">{employee.email}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell className="py-4">
                      <div className="flex items-center justify-center">
                        <Badge
                          variant="outline"
                          className="bg-purple-50 text-purple-700 border-purple-200 font-medium px-3 py-1"
                        >
                          {employee.department}
                        </Badge>
                      </div>
                    </TableCell>
                    
                    <TableCell className="py-4">
                      <div className="flex items-center justify-center">
                        <RoleBadge role={employee.role} />
                      </div>
                    </TableCell>
                    
                    <TableCell className="py-4 text-center">
                      {employee.status === "ACTIVE" ? (
                        <Badge className="bg-green-500 text-white hover:bg-green-600 font-medium px-3 py-1 shadow-sm">
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-red-500 text-white hover:bg-red-600 font-medium px-3 py-1 shadow-sm">
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    
                    <TableCell className="py-4">
                      <div className="flex justify-center gap-2">
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
