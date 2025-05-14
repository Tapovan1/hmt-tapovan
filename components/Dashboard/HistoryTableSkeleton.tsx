import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function HistoryTableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-medium text-gray-700">Date</TableHead>
            <TableHead className="font-medium text-gray-700">
              Check In
            </TableHead>
            <TableHead className="font-medium text-gray-700">
              Check Out
            </TableHead>
            <TableHead className="font-medium text-gray-700">Status</TableHead>
            <TableHead className="font-medium text-gray-700">Photo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index} className="border-b border-gray-100">
              <TableCell>
                <Skeleton className="h-5 w-28" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-20 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-9 w-9 rounded-full" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
