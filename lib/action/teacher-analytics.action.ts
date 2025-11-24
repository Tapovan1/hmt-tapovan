"use server";

import prisma from "@/lib/prisma";

type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export type TeacherInsight = {
  id: string;
  name: string;
  department: string;
  catagory: string;
  lateCount: number;
  avgLateMinutes: number;
  earlyExitCount: number;
  avgEarlyMinutes: number;
  absentCount: number;
  leaveDays: number;
  ruleBreaks: number;
  riskScore: number;
  riskLevel: RiskLevel;
  recommendations: string[];
};

export type RecommendationItem = {
  teacherId: string;
  teacherName: string;
  department: string;
  message: string;
  severity: RiskLevel;
};

export type TeacherAnalyticsResponse = {
  period: {
    month: number;
    year: number;
    label: string;
    workingDays: number;
  };
  filters: {
    department?: string;
    catagory?: string;
  };
  summary: {
    totalTeachers: number;
    totalLateEvents: number;
    totalEarlyEvents: number;
    totalAbsences: number;
    totalLeaveDays: number;
    averageLateMinutes: number;
    highRiskTeachers: number;
  };
  topLateArrivals: TeacherInsight[];
  topEarlyDepartures: TeacherInsight[];
  chronicRuleBreakers: TeacherInsight[];
  recommendations: RecommendationItem[];
  teacherInsights: TeacherInsight[];
};

type TeacherAnalyticsParams = {
  month?: number;
  year?: number;
  department?: string;
  catagory?: string;
  limit?: number;
};

const EXCLUDED_ROLES = ["ADMIN", "SUPERADMIN", "SECURITY"];

const createMonthRange = (month?: number, year?: number) => {
  const now = new Date();
  const monthIndex = (month ?? now.getUTCMonth() + 1) - 1;
  const selectedYear = year ?? now.getUTCFullYear();

  const start = new Date(Date.UTC(selectedYear, monthIndex, 1));
  const end = new Date(
    Date.UTC(selectedYear, monthIndex + 1, 0, 23, 59, 59, 999),
  );

  return {
    start,
    end,
    label: start.toLocaleString("en-US", { month: "long", year: "numeric" }),
    month: monthIndex + 1,
    year: selectedYear,
  };
};

const calculateWorkingDays = (start: Date, end: Date) => {
  const cursor = new Date(start);
  let count = 0;
  while (cursor <= end) {
    if (cursor.getUTCDay() !== 0) {
      count += 1;
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return count;
};

const calculateOverlapDays = (
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date,
) => {
  const overlapStart = new Date(Math.max(startA.getTime(), startB.getTime()));
  const overlapEnd = new Date(Math.min(endA.getTime(), endB.getTime()));
  if (overlapStart > overlapEnd) {
    return 0;
  }
  overlapStart.setUTCHours(0, 0, 0, 0);
  overlapEnd.setUTCHours(0, 0, 0, 0);
  return Math.floor(
    (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24),
  ) + 1;
};

const determineRiskLevel = (score: number): RiskLevel => {
  if (score >= 12) return "HIGH";
  if (score >= 6) return "MEDIUM";
  return "LOW";
};

const buildRecommendations = (insight: {
  lateCount: number;
  avgLateMinutes: number;
  earlyExitCount: number;
  avgEarlyMinutes: number;
  absentCount: number;
  leaveDays: number;
}) => {
  const messages: string[] = [];

  if (insight.lateCount >= 3) {
    messages.push(
      `Recorded ${insight.lateCount} late check-ins. Consider a punctuality reminder.`,
    );
  } else if (insight.avgLateMinutes >= 10) {
    messages.push(
      `Average late arrival is ${insight.avgLateMinutes} minutes. Review commute or schedule.`,
    );
  }

  if (insight.earlyExitCount >= 2) {
    messages.push(
      `Left early ${insight.earlyExitCount} times. Reinforce checkout discipline.`,
    );
  } else if (insight.avgEarlyMinutes >= 15) {
    messages.push(
      `Average early exit is ${insight.avgEarlyMinutes} minutes. Verify classroom handover.`,
    );
  }

  if (insight.absentCount >= 2) {
    messages.push(
      `Marked absent ${insight.absentCount} days. Schedule a check-in conversation.`,
    );
  }

  if (insight.leaveDays >= 3) {
    messages.push(
      `Consumed ${insight.leaveDays} leave days. Validate balance against policy.`,
    );
  }

  if (messages.length === 0) {
    messages.push("No rule breaks detected. Share positive feedback.");
  }

  return messages;
};

export async function getTeacherBehaviorInsights(
  params: TeacherAnalyticsParams = {},
): Promise<TeacherAnalyticsResponse> {
  const { month, year, department, catagory } = params;
  const limit = params.limit ?? 5;
  const period = createMonthRange(month, year);
  const workingDays = calculateWorkingDays(period.start, period.end);

  const teachers = await prisma.user.findMany({
    where: {
      status: "ACTIVE",
      role: { notIn: EXCLUDED_ROLES },
      ...(department ? { department } : {}),
      ...(catagory ? { catagory } : {}),
    },
    select: {
      id: true,
      name: true,
      department: true,
      catagory: true,
    },
  });

  const teacherMap = new Map<
    string,
    TeacherInsight & {
      totalLateMinutes: number;
      totalEarlyMinutes: number;
    }
  >();

  teachers.forEach((teacher) => {
    teacherMap.set(teacher.id, {
      id: teacher.id,
      name: teacher.name,
      department: teacher.department,
      catagory: teacher.catagory,
      lateCount: 0,
      avgLateMinutes: 0,
      earlyExitCount: 0,
      avgEarlyMinutes: 0,
      absentCount: 0,
      leaveDays: 0,
      ruleBreaks: 0,
      riskScore: 0,
      riskLevel: "LOW",
      recommendations: [],
      totalLateMinutes: 0,
      totalEarlyMinutes: 0,
    });
  });

  if (teacherMap.size === 0) {
    return {
      period: {
        ...period,
        workingDays,
      },
      filters: { department, catagory },
      summary: {
        totalTeachers: 0,
        totalLateEvents: 0,
        totalEarlyEvents: 0,
        totalAbsences: 0,
        totalLeaveDays: 0,
        averageLateMinutes: 0,
        highRiskTeachers: 0,
      },
      topLateArrivals: [],
      topEarlyDepartures: [],
      chronicRuleBreakers: [],
      recommendations: [],
      teacherInsights: [],
    };
  }

  const attendanceRecords = await prisma.attendance.findMany({
    where: {
      date: {
        gte: period.start,
        lte: period.end,
      },
      userId: {
        in: teachers.map((teacher) => teacher.id),
      },
    },
    select: {
      userId: true,
      status: true,
      late: true,
      early: true,
    },
  });

  attendanceRecords.forEach((record) => {
    const insight = teacherMap.get(record.userId);
    if (!insight) return;
    if (record.status === "LATE" || (record.late ?? 0) > 0) {
      insight.lateCount += 1;
      insight.totalLateMinutes += record.late ?? 0;
    }
    if ((record.early ?? 0) > 0) {
      insight.earlyExitCount += 1;
      insight.totalEarlyMinutes += record.early ?? 0;
    }
    if (record.status === "ABSENT") {
      insight.absentCount += 1;
    }
  });

  const leaveRecords = await prisma.teacherLeave.findMany({
    where: {
      status: "APPROVED",
      startDate: { lte: period.end },
      endDate: { gte: period.start },
      userId: {
        in: teachers.map((teacher) => teacher.id),
      },
    },
    select: {
      userId: true,
      startDate: true,
      endDate: true,
    },
  });

  leaveRecords.forEach((leave) => {
    const insight = teacherMap.get(leave.userId);
    if (!insight) return;
    const days = calculateOverlapDays(
      leave.startDate,
      leave.endDate,
      period.start,
      period.end,
    );
    if (days > 0) {
      insight.leaveDays += days;
    }
  });

  const teacherInsights = Array.from(teacherMap.values()).map((insight) => {
    const { totalLateMinutes, totalEarlyMinutes, ...rest } = insight;
    const lateAverage =
      rest.lateCount > 0
        ? Math.round(totalLateMinutes / rest.lateCount)
        : 0;
    const earlyAverage =
      rest.earlyExitCount > 0
        ? Math.round(totalEarlyMinutes / rest.earlyExitCount)
        : 0;
    const ruleBreaks =
      rest.lateCount + rest.earlyExitCount + rest.absentCount;
    const riskScore =
      rest.lateCount * 2 +
      rest.earlyExitCount * 1.5 +
      rest.absentCount * 3 +
      rest.leaveDays * 0.5;
    const riskLevel = determineRiskLevel(riskScore);
    const messages = buildRecommendations({
      lateCount: rest.lateCount,
      avgLateMinutes: lateAverage,
      earlyExitCount: rest.earlyExitCount,
      avgEarlyMinutes: earlyAverage,
      absentCount: rest.absentCount,
      leaveDays: rest.leaveDays,
    });

    return {
      ...rest,
      avgLateMinutes: lateAverage,
      avgEarlyMinutes: earlyAverage,
      ruleBreaks,
      riskScore: Number(riskScore.toFixed(1)),
      riskLevel,
      recommendations: messages,
    };
  });

  const summary = teacherInsights.reduce(
    (acc, insight) => {
      acc.totalLateEvents += insight.lateCount;
      acc.totalEarlyEvents += insight.earlyExitCount;
      acc.totalAbsences += insight.absentCount;
      acc.totalLeaveDays += insight.leaveDays;
      acc.totalLateMinutes += insight.avgLateMinutes * insight.lateCount;
      if (insight.riskLevel === "HIGH") {
        acc.highRiskTeachers += 1;
      }
      return acc;
    },
    {
      totalLateEvents: 0,
      totalEarlyEvents: 0,
      totalAbsences: 0,
      totalLeaveDays: 0,
      totalLateMinutes: 0,
      highRiskTeachers: 0,
    },
  );

  const totalLateOccurrences = teacherInsights.reduce(
    (acc, insight) => acc + insight.lateCount,
    0,
  );

  const averageLateMinutes =
    totalLateOccurrences > 0
      ? Math.round(summary.totalLateMinutes / totalLateOccurrences)
      : 0;

  const sortedByLate = teacherInsights
    .filter((insight) => insight.lateCount > 0)
    .sort(
      (a, b) =>
        b.lateCount - a.lateCount ||
        b.avgLateMinutes - a.avgLateMinutes ||
        b.riskScore - a.riskScore,
    )
    .slice(0, limit);

  const sortedByEarly = teacherInsights
    .filter((insight) => insight.earlyExitCount > 0)
    .sort(
      (a, b) =>
        b.earlyExitCount - a.earlyExitCount ||
        b.avgEarlyMinutes - a.avgEarlyMinutes ||
        b.riskScore - a.riskScore,
    )
    .slice(0, limit);

  const sortedByRisk = teacherInsights
    .filter((insight) => insight.ruleBreaks > 0)
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, limit);

  const recommendationFeed: RecommendationItem[] = teacherInsights
    .flatMap((insight) =>
      insight.recommendations.map((message) => ({
        teacherId: insight.id,
        teacherName: insight.name,
        department: insight.department,
        message,
        severity: insight.riskLevel,
      })),
    )
    .slice(0, limit * 2);

  return {
    period: {
      ...period,
      workingDays,
    },
    filters: {
      department,
      catagory,
    },
    summary: {
      totalTeachers: teacherInsights.length,
      totalLateEvents: summary.totalLateEvents,
      totalEarlyEvents: summary.totalEarlyEvents,
      totalAbsences: summary.totalAbsences,
      totalLeaveDays: summary.totalLeaveDays,
      averageLateMinutes,
      highRiskTeachers: summary.highRiskTeachers,
    },
    topLateArrivals: sortedByLate,
    topEarlyDepartures: sortedByEarly,
    chronicRuleBreakers: sortedByRisk,
    recommendations: recommendationFeed,
    teacherInsights: teacherInsights.sort((a, b) => b.riskScore - a.riskScore),
  };
}

