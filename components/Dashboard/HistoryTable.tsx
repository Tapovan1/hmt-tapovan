import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import DateSelector from "../month-year";

interface HistoryTableProps {
  records: any[];
}

export function HistoryTable({ records }: HistoryTableProps) {
  return (
    <div className="">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Check In</TableHead>
            <TableHead>Check Out</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Photo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell>{format(new Date(record.date), "PPP")}</TableCell>
              <TableCell>
                {
                  new Date(record.checkIn)
                    .toISOString()
                    .split("T")[1]
                    .split(".")[0]
                }
              </TableCell>
              <TableCell>
                {
                  new Date(record.checkOut)
                    .toISOString()
                    .split("T")[1]
                    .split(".")[0]
                }
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
                  <AvatarImage src={record.photo} alt="Attendance Photo" />
                  <AvatarFallback>NA</AvatarFallback>
                </Avatar>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
