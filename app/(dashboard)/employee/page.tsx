import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { getEmployees } from "@/lib/action/user.action";
import EmploteeDialog from "@/components/Dashboard/EmployeeDialog";
import Delete from "./Delete";
import EditEmployeeDialog from "@/components/Dashboard/EditEmployeeDialog";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

export default async function EmployeesPage() {
  const data = await getEmployees();

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-[#e6eef8] p-2.5 rounded-full">
            <Users className="h-5 w-5 text-[#4285f4]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Manage Employee Data
          </h1>
        </div>

        <EmploteeDialog />
      </div>
      <div className="bg-[#4285f4] rounded-t-sm shadow-sm text-white py-3 px-6 font-medium">
        Monthly Attendance Records
      </div>
      {/* Employee Table */}
      <Card className="bg-white  overflow-hidden rounded-none">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent  border-gray-200">
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
                <TableHead className="font-medium text-center text-gray-700 py-3 ">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    <div className="flex flex-col items-center justify-center text-center">
                      <Users className="h-10 w-10 text-gray-300 mb-2" />
                      <p className="text-gray-500">No employees found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data?.map((employee) => (
                  <TableRow
                    key={employee.id}
                    className="hover:bg-gray-50/50 border-b border-gray-100"
                  >
                    <TableCell className="py-2.5">
                      <div className="flex items-center justify-center gap-3">
                        <span className="font-medium text-gray-800 ">
                          {employee.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className=" py-2.5">
                      <div className="flex items-center justify-center gap-3">
                        <Badge
                          variant="outline"
                          className="bg-gray-50 text-gray-700  font-normal"
                        >
                          {employee.department}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className=" py-2.5">
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
          Teacher
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
