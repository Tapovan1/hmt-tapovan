import { format } from "date-fns";
import { getHolidays } from "@/lib/action/holiday.action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, CalendarX, RotateCcw } from "lucide-react";
import { HolidayDialog } from "./holiday-dialog";
import { DeleteHolidayButton } from "./delete-holiday-button";

interface HolidayTableProps {
  month?: number;
  year: number;
  type: string;
}

export async function HolidayTable({ month, year, type }: HolidayTableProps) {
  const holidays = await getHolidays(year, month, type);

  if (holidays.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="bg-gray-100 p-4 rounded-full mb-4">
          <CalendarX className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-700">No holidays found</h3>
        <p className="text-gray-500 mt-2 max-w-md">
          {month
            ? `No holidays found for the selected month and filters.`
            : `No holidays found for ${year} with the selected filters.`}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="py-4 px-6 font-medium text-gray-700">
              Holiday Name
            </TableHead>
            <TableHead className="py-4 px-6 font-medium text-gray-700">
              Date
            </TableHead>
            <TableHead className="py-4 px-6 font-medium text-gray-700">
              Type
            </TableHead>

            <TableHead className="py-4 px-6 font-medium text-gray-700">
              Description
            </TableHead>

            <TableHead className="py-4 px-6 font-medium text-gray-700 text-center">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {holidays.map((holiday) => (
            <TableRow
              key={holiday.id}
              className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
            >
              <TableCell className="py-4 px-6 font-medium text-gray-800">
                {holiday.name}
              </TableCell>
              <TableCell className="py-4 px-6 text-gray-700">
                {format(new Date(holiday.date), "dd MMM yyyy")}
              </TableCell>
              <TableCell className="py-4 px-6">
                <HolidayTypeBadge type={holiday.type} />
              </TableCell>

              <TableCell className="py-4 px-6 text-gray-700 max-w-[200px] truncate">
                {holiday.description || "—"}
              </TableCell>

              <TableCell className="py-4 px-6">
                <div className="flex justify-center gap-2">
                  <HolidayDialog holiday={holiday}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-[#4285f4]"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                  </HolidayDialog>
                  <DeleteHolidayButton id={holiday.id} name={holiday.name} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function HolidayTypeBadge({ type }: { type: string }) {
  const typeConfig = {
    NATIONAL: {
      color: "bg-green-100 text-green-800 border-green-200",
      label: "National",
    },
    RELIGIOUS: {
      color: "bg-purple-100 text-purple-800 border-purple-200",
      label: "Religious",
    },
    SCHOOL: {
      color: "bg-orange-100 text-orange-800 border-orange-200",
      label: "School",
    },
    LOCAL: { color: "bg-red-100 text-red-800 border-red-200", label: "Local" },
  };

  const config =
    typeConfig[type as keyof typeof typeConfig] || typeConfig.SCHOOL;

  return (
    <Badge className={`${config.color} hover:${config.color}`}>
      {config.label}
    </Badge>
  );
}
