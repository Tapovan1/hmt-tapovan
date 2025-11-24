"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getTeacherBehaviorInsights,
  type TeacherAnalyticsResponse,
  type TeacherInsight,
} from "@/lib/action/teacher-analytics.action";
import { departmentList, catagoryList } from "@/lib/departments";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  Calendar,
  Clock,
  Loader2,
  LogOut,
  ShieldAlert,
  TrendingUp,
  UserCheck,
} from "lucide-react";

const months = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const years = (() => {
  const now = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => now - 2 + i);
})();

const riskBadgeClasses: Record<string, string> = {
  LOW: "bg-emerald-100 text-emerald-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  HIGH: "bg-rose-100 text-rose-700",
};

const RiskBadge = ({ level }: { level: TeacherInsight["riskLevel"] }) => (
  <Badge className={`${riskBadgeClasses[level]} border-none`}>{level}</Badge>
);
//test

export default function TeacherAnalyticsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [department, setDepartment] = useState<string>();
  const [catagory, setCatagory] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TeacherAnalyticsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    const fetchInsights = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getTeacherBehaviorInsights({
          month,
          year,
          department,
          catagory,
        });
        if (!ignore) {
          setData(response);
        }
      } catch (err) {
        console.error("Failed to load teacher analytics", err);
        if (!ignore) {
          setError("Unable to load analytics. Please try again.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchInsights();
    return () => {
      ignore = true;
    };
  }, [month, year, department, catagory]);

  const sortedInsights = useMemo(() => {
    if (!data) return [];
    return [...data.teacherInsights].sort((a, b) => b.riskScore - a.riskScore);
  }, [data]);

  const handleResetFilters = () => {
    setDepartment(undefined);
    setCatagory(undefined);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="bg-[#e6eef8] p-3 rounded-full">
            <TrendingUp className="h-6 w-6 text-[#4285f4]" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Teacher Behavior Insights
            </h1>
            <p className="text-sm text-gray-500">
              Detect punctuality issues, early exits, and leave patterns in a
              single glance.
            </p>
          </div>
        </div>
      </div>

      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-gray-700">
            <Calendar className="h-4 w-4 text-[#4285f4]" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Select
            value={month.toString()}
            onValueChange={(value) => setMonth(Number.parseInt(value))}
          >
            <SelectTrigger className="h-10 border-gray-200">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m.value} value={m.value.toString()}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={year.toString()}
            onValueChange={(value) => setYear(Number.parseInt(value))}
          >
            <SelectTrigger className="h-10 border-gray-200">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={department ?? "all"}
            onValueChange={(value) =>
              setDepartment(value === "all" ? undefined : value)
            }
          >
            <SelectTrigger className="h-10 border-gray-200">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departmentList.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Select
              value={catagory ?? "all"}
              onValueChange={(value) =>
                setCatagory(value === "all" ? undefined : value)
              }
            >
              <SelectTrigger className="h-10 border-gray-200">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {catagoryList.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="border-gray-200"
              onClick={handleResetFilters}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#4285f4]" />
        </div>
      ) : error ? (
        <Card className="border-red-100 bg-red-50/60">
          <CardContent className="flex items-center gap-3 p-6">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-medium text-red-700">{error}</p>
              <p className="text-sm text-red-600">
                Adjust filters or reload the page.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : data && data.summary.totalTeachers === 0 ? (
        <Card className="border-dashed border-gray-200">
          <CardContent className="py-12 text-center space-y-3">
            <ShieldAlert className="h-10 w-10 text-gray-400 mx-auto" />
            <p className="font-medium text-gray-700">
              No teachers found for the selected filters
            </p>
            <p className="text-sm text-gray-500">
              Try expanding your filters to view analytics.
            </p>
          </CardContent>
        </Card>
      ) : (
        data && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <StatCard
                label="Total Teachers"
                value={data.summary.totalTeachers}
                description={`Working days: ${data.period.workingDays}`}
                icon={<UserCheck className="h-5 w-5 text-[#4285f4]" />}
              />
              <StatCard
                label="Late Check-ins"
                value={data.summary.totalLateEvents}
                description={`Avg delay ${data.summary.averageLateMinutes} mins`}
                icon={<Clock className="h-5 w-5 text-amber-600" />}
              />
              <StatCard
                label="Early Check-outs"
                value={data.summary.totalEarlyEvents}
                description="Review exit compliance"
                icon={<LogOut className="h-5 w-5 text-indigo-600" />}
              />
              <StatCard
                label="Absences"
                value={data.summary.totalAbsences}
                description="Marked ABSENT in attendance"
                icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
              />
              <StatCard
                label="Leave Days"
                value={data.summary.totalLeaveDays}
                description="Approved leave consumed"
                icon={<Calendar className="h-5 w-5 text-emerald-600" />}
              />
              <StatCard
                label="High-Risk Teachers"
                value={data.summary.highRiskTeachers}
                description="Require immediate attention"
                icon={<ShieldAlert className="h-5 w-5 text-rose-600" />}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <InsightList
                title="Frequent Late Check-ins"
                description="Teachers with highest late occurrences"
                items={data.topLateArrivals}
                icon={<Clock className="h-5 w-5 text-amber-600" />}
                metricKey="lateCount"
                metricLabel="late days"
              />
              <InsightList
                title="Early Check-outs"
                description="Teachers leaving before scheduled time"
                items={data.topEarlyDepartures}
                icon={<LogOut className="h-5 w-5 text-indigo-600" />}
                metricKey="earlyExitCount"
                metricLabel="early exits"
              />
              <InsightList
                title="Rule Breakers"
                description="Highest combined violations"
                items={data.chronicRuleBreakers}
                icon={<ShieldAlert className="h-5 w-5 text-rose-600" />}
                metricKey="ruleBreaks"
                metricLabel="issues"
              />
            </div>

            <Card className="border-gray-100 shadow-sm">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-lg font-semibold text-gray-800">
                  Risk Scoring Guide
                </CardTitle>
                <p className="text-sm text-gray-500">
                  Understand how the score and risk levels are calculated.
                </p>
              </CardHeader>
              <CardContent className="p-6 grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700">
                    Score formula
                  </p>
                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
                    <p>
                      Score = (Late days × 2) + (Early exits × 1.5) + (Absences ×
                      3) + (Leave days × 0.5)
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                      Higher scores indicate more rule breaks.
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700">
                    Risk levels
                  </p>
                  <div className="rounded-lg border border-gray-100">
                    <LegendRow colorClass="bg-rose-100 text-rose-700">
                      High risk (score ≥ 12)
                    </LegendRow>
                    <LegendRow colorClass="border-t border-gray-100 bg-amber-100 text-amber-700">
                      Medium risk (score 6 - 11.9)
                    </LegendRow>
                    <LegendRow colorClass="border-t border-gray-100 bg-emerald-100 text-emerald-700">
                      Low risk (score &lt; 6)
                    </LegendRow>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-100 shadow-sm">
              <CardHeader className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between border-b border-gray-100">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-800">
                    Recommendations Feed
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    Auto-generated coaching tips per teacher
                  </p>
                </div>
              </CardHeader>
              <CardContent className="divide-y divide-gray-100 p-0">
                {data.recommendations.length === 0 ? (
                  <div className="py-10 text-center text-gray-500">
                    No recommendations for this period.
                  </div>
                ) : (
                  data.recommendations.map((rec) => (
                    <div
                      key={`${rec.teacherId}-${rec.message}`}
                      className="flex items-start gap-3 p-4"
                    >
                      <RiskBadge level={rec.severity} />
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          {rec.teacherName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {rec.department}
                        </p>
                        <p className="text-sm text-gray-700 mt-2">
                          {rec.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-gray-100 shadow-sm">
              <CardHeader className="border-b border-gray-100">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-800">
                      Teacher Compliance Table
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      Sorted by risk score for quick action
                    </p>
                  </div>
                  <Badge variant="outline" className="text-gray-600">
                    Period: {data.period.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#f8fafc]">
                      <TableHead>Teacher</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Late</TableHead>
                      <TableHead>Early Exit</TableHead>
                      <TableHead>Absences</TableHead>
                      <TableHead>Leave Days</TableHead>
                      <TableHead>Rule Breaks</TableHead>
                      <TableHead>Risk</TableHead>
                      <TableHead>Next Step</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedInsights.map((insight) => (
                      <TableRow key={insight.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium text-gray-800">
                          {insight.name}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {insight.department}
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-gray-800">
                            {insight.lateCount}
                          </span>
                          <p className="text-xs text-gray-500">
                            Avg {insight.avgLateMinutes}m
                          </p>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-gray-800">
                            {insight.earlyExitCount}
                          </span>
                          <p className="text-xs text-gray-500">
                            Avg {insight.avgEarlyMinutes}m
                          </p>
                        </TableCell>
                        <TableCell>{insight.absentCount}</TableCell>
                        <TableCell>{insight.leaveDays}</TableCell>
                        <TableCell>{insight.ruleBreaks}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <RiskBadge level={insight.riskLevel} />
                            <span className="text-xs text-gray-500">
                              Score {insight.riskScore}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {insight.recommendations[0]}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )
      )}
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: number;
  description: string;
  icon: ReactNode;
};

function StatCard({ label, value, description, icon }: StatCardProps) {
  return (
    <Card className="border-gray-100 shadow-sm">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <h3 className="text-2xl font-semibold text-gray-800">{value}</h3>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

type InsightListProps = {
  title: string;
  description: string;
  items: TeacherInsight[];
  icon: ReactNode;
  metricLabel: string;
  metricKey: "lateCount" | "earlyExitCount" | "ruleBreaks";
};

function InsightList({
  title,
  description,
  items,
  icon,
  metricLabel,
  metricKey,
}: InsightListProps) {
  const getMetricDetail = (item: TeacherInsight) => {
    if (metricKey === "lateCount") {
      return `Avg ${item.avgLateMinutes} min late`;
    }
    if (metricKey === "earlyExitCount") {
      return `Avg ${item.avgEarlyMinutes} min early`;
    }
    return `${item.absentCount} absences • ${item.leaveDays} leave days`;
  };

  return (
    <Card className="border-gray-100 shadow-sm h-full">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <CardTitle className="text-base text-gray-800">{title}</CardTitle>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {items.length === 0 ? (
          <div className="py-10 text-center text-gray-500 text-sm">
            No data available for this bucket.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map((item) => {
              const metricValue =
                metricKey === "lateCount"
                  ? item.lateCount
                  : metricKey === "earlyExitCount"
                    ? item.earlyExitCount
                    : item.ruleBreaks;
              return (
                <div
                  key={item.id}
                  className="p-4 flex items-start gap-4 hover:bg-[#f8fafc] transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6eef8] text-sm font-semibold text-[#4285f4]">
                    {item.name
                      .split(" ")
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.department}
                        </p>
                      </div>
                      <RiskBadge level={item.riskLevel} />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-2xl font-semibold text-gray-800 leading-none">
                          {metricValue}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {metricLabel}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {getMetricDetail(item)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Score {item.riskScore}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LegendRow({
  children,
  colorClass,
}: {
  children: React.ReactNode;
  colorClass: string;
}) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2 text-sm ${colorClass}`}>
      <div className="h-2 w-2 rounded-full bg-current"></div>
      {children}
    </div>
  );
}
               

