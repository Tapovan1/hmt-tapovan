import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatIndianTime } from "@/lib/utils/date-format";
import {
  getTodayAdminAttendance,
  getDepartments,
} from "@/lib/action/history.action";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DepartmentFilter } from "./components/department-filter";
import { Pagination } from "./components/pagination";

const ITEMS_PER_PAGE = 10;

export default async function AdminHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ department?: string; page?: string }>;
}) {
  // Await the searchParams promise
  const params = await searchParams;

  const currentPage = Number(params.page) || 1;
  const department =
    params.department === "all" ? undefined : params.department;

  // Get departments and attendance data
  const [uniqueDepartments, attendanceData] = await Promise.all([
    getDepartments(),
    getTodayAdminAttendance(
      department,
      ITEMS_PER_PAGE,
      (currentPage - 1) * ITEMS_PER_PAGE
    ),
  ]);

  const { records: attendanceRecords, totalCount } = attendanceData;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Today&apos;s Attendance</h1>
        <DepartmentFilter departments={uniqueDepartments} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Photo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">
                    {record.user.name}
                  </TableCell>
                  <TableCell>{record.user.department}</TableCell>
                  <TableCell>
                    {record.checkIn
                      ? formatIndianTime(record.checkIn.toString())
                      : "Not checked in"}
                  </TableCell>
                  <TableCell>
                    {record.checkOut
                      ? formatIndianTime(record.checkOut.toString())
                      : "Not checked out"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${
                        record.status === "PRESENT"
                          ? "bg-green-100 text-green-800"
                          : record.status === "LATE"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {record.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={record.photo || ""}
                        alt="Attendance Photo"
                      />
                      <AvatarFallback>NA</AvatarFallback>
                    </Avatar>
                  </TableCell>
                </TableRow>
              ))}
              {attendanceRecords.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-8"
                  >
                    No attendance records found for today
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <div className="flex flex-col items-center space-y-4 mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {attendanceRecords.length} of {totalCount} records
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
