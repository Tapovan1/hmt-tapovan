import { getPendingLeaves } from "@/lib/action/teacherLeave.action";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const LeaveRequestAction = async () => {
  const data = await getPendingLeaves();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave Request</CardTitle>
      </CardHeader>
      {data.length === 0 && (
        <div className="flex items-center justify-center h-full p-4 text-sm text-gray-500">
          No pending leave requests
        </div>
      )}
      <CardContent>
        <div>
          <ul>
            {data.map((leave) => (
              <li key={leave.id}>
                {leave.name} - {leave.department} (
                {new Date(leave.startDate.toDateString()).toLocaleDateString()}{" "}
                to {new Date(leave.endDate.toDateString()).toLocaleDateString()}
                )
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaveRequestAction;
