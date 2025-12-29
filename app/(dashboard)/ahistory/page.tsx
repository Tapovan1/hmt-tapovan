import { formatIndianTime } from "@/lib/utils/date-format";
import { getTodayAdminAttendance } from "@/lib/action/history.action";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DepartmentFilter } from "./components/department-filter";
import { ViewPhotoButton } from "./components/view-photo-button";
import { HistoryTableWrapper } from "./components/history-table-wrapper";
import { Pagination } from "@/components/pagination";
import {
  CalendarClock,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { departmentList } from "@/lib/departments";

const ITEMS_PER_PAGE = 10;

export default async function AdminHistoryPage({
  searchParams,
}: {
  searchParams: { department?: string; page?: string };
}) {
  // Await the searchParams object before accessing its properties
  const params = await searchParams;

  const currentPage = Number(params.page) || 1;
  const selectedDepartment =
    params.department === "all" ? undefined : params.department;

  const attendanceData = await getTodayAdminAttendance(
    selectedDepartment,
    ITEMS_PER_PAGE,
    (currentPage - 1) * ITEMS_PER_PAGE
  );

  const { records: attendanceRecords, totalCount } = attendanceData;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-[#e6eef8] p-3 rounded-full">
            <CalendarClock className="h-6 w-6 text-[#4285f4]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Today&#39;s Attendance
          </h1>
        </div>
        <DepartmentFilter departments={departmentList} />
      </div>

      <HistoryTableWrapper>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="bg-[#4285f4] text-white py-3 px-6 font-medium flex items-center">
          <Users className="h-5 w-5 mr-2" />
          <span>Staff Attendance Records</span>
          <div className="ml-auto flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-1" />
            <span>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-[#4285f4]">
                <TableHead className="py-4 px-6 font-semibold text-gray-800 min-w-[180px]">
                  Name
                </TableHead>
                <TableHead className="py-4 px-6 font-semibold text-gray-800 min-w-[150px]">
                  Department
                </TableHead>
                <TableHead className="py-4 px-6 font-semibold text-gray-800 min-w-[140px]">
                  Check In
                </TableHead>
                <TableHead className="py-4 px-6 font-semibold text-gray-800 min-w-[140px]">
                  Check Out
                </TableHead>
                <TableHead className="py-4 px-6 font-semibold text-gray-800 min-w-[120px]">
                  Status
                </TableHead>
                <TableHead className="py-4 px-6 font-semibold text-gray-800 min-w-[120px] text-center">
                  Photo
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <CalendarClock className="h-10 w-10 text-gray-300 mb-2" />
                      <p className="text-lg font-medium">
                        No attendance records found for today
                      </p>
                      {selectedDepartment && (
                        <p className="text-sm mt-1">
                          Try selecting a different department
                        </p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                attendanceRecords.map((record, index) => (
                  <TableRow
                    key={record.id}
                    className={`border-b border-gray-100 hover:bg-blue-50/50 transition-all duration-200 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                    }`}
                  >
                    <TableCell className="py-4 px-6 font-medium text-gray-800">
                      <Link
                        href={`/ahistory/${record.id}`}
                        className="flex items-center gap-2 hover:text-[#4285f4] transition-colors"
                      >
                        {record.user.name}
                      </Link>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-gray-700">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-sm font-medium">
                        {record.user.department}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-gray-700">
                      {record.checkIn ? (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-[#4285f4] mr-1.5" />
                          <span className="font-medium">{formatIndianTime(record.checkIn.toString())}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Not checked in</span>
                      )}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-gray-700">
                      {record.checkOut ? (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-[#4285f4] mr-1.5" />
                          <span className="font-medium">{formatIndianTime(record.checkOut.toString())}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Not checked out</span>
                      )}
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <StatusBadge status={record.status} late={record.late} />
                    </TableCell>
                    <TableCell className="py-4 px-6 text-center">
                      <ViewPhotoButton
                        attendanceId={record.id}
                        userName={record.user.name}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col items-center space-y-3 mt-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount}{" "}
            records
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} />
        </div>
        )}
      </HistoryTableWrapper>
    </div>
  );
}

function StatusBadge({ status, late }: { status: string; late?: number }) {
  switch (status) {
    case "PRESENT":
      return (
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800">
          <CheckCircle className="h-3.5 w-3.5 mr-1" />
          <span className="text-sm font-medium">Present</span>
        </div>
      );
    case "LATE":
      return (
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-50 text-amber-800">
          <Clock className="h-3.5 w-3.5 mr-1" />
          <span className="text-sm font-medium">Late - {late ? late : 0} </span>
        </div>
      );
    case "ABSENT":
      return (
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-800">
          <AlertTriangle className="h-3.5 w-3.5 mr-1" />
          <span className="text-sm font-medium">Absent</span>
        </div>
      );
    default:
      return (
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-800">
          <span className="text-sm font-medium">{status}</span>
        </div>
      );
  }
}
