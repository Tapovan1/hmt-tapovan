import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <Button className="w-full" asChild>
            <Link href="/attendance">Mark Attendance</Link>
          </Button>
          <Button className="w-full" variant="outline" asChild>
            <Link href="/history">View History</Link>
          </Button>
          <Button className="w-full" variant="outline">
            Request Leave
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
