import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

export default function RecentAttendance({
  recentAttendance,
}: {
  recentAttendance: {
    date: string;
    checkIn?: string;
    status: "PRESENT" | "LATE" | "ABSENT";
  }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Attendance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentAttendance.map((record, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <div className="font-medium">
                  {format(new Date(record.date), "yyyy-MM-dd")}
                </div>
                <div className="text-sm text-muted-foreground">
                  {record.checkIn
                    ? `Checked in at ${
                        new Date(record.checkIn)
                          .toISOString()
                          .split("T")[1]
                          .split(".")[0]
                      }`
                    : "Not marked"}
                </div>
              </div>
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
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
