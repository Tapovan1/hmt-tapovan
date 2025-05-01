import { Card, CardContent } from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getEmployees } from "@/lib/action/user.action";

import EmploteeDialog from "@/components/Dashboard/EmployeeDialog";
import Delete from "./Delete";
import EditEmployeeDialog from "@/components/Dashboard/EditEmployeeDialog";

export default async function EmployeesPage() {
  const data = await getEmployees();
  return (
    <div className="p-4 space-y-6">
      <EmploteeDialog />
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {data?.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src="/placeholder.svg"
                          alt={employee.name}
                        />
                        <AvatarFallback>
                          {employee.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{employee.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.role}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <EditEmployeeDialog employee={employee} />
                      <Delete id={employee.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
