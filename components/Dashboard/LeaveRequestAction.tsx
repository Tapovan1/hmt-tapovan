import { getPendingLeaves } from "@/lib/action/teacherLeave.action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, ArrowRight, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

const LeaveRequestAction = async () => {
  const data = await getPendingLeaves();

  return (
    <Card className="border-gray-100 shadow-sm">
      <CardHeader className=" border-b border-gray-100">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Pending Leave Requests
          </CardTitle>
          <Link
            href="/ateacher-leave"
            className="text-[#4285f4] hover:text-[#3b78e7] text-sm font-medium flex items-center"
          >
            View all
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CalendarDays className="h-12 w-12 text-gray-300 " />
            <h3 className="text-lg font-medium text-gray-700">
              No pending leave requests
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              All leave requests have been processed
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((leave) => (
              <div
                key={leave.id}
                className="p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-medium text-gray-800">
                        {leave.name}
                      </h3>
                      <Badge className="ml-2 bg-[#e6eef8] text-[#4285f4] hover:bg-[#e6eef8]">
                        {leave.department}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {format(new Date(leave.startDate), "dd MMM yyyy")} -{" "}
                      {format(new Date(leave.endDate), "dd MMM yyyy")}
                    </p>
                  </div>
                  <Badge className="bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-50">
                    Pending
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeaveRequestAction;
