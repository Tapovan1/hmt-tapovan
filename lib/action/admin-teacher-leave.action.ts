"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { endOfMonth, parseISO } from "date-fns";

// Get teacher leave statistics for admin dashboard
export async function getTeacherLeaveStats() {
  // Check if user is admin

  try {
    // Get counts for different statuses
    const total = await prisma.teacherLeave.count();

    const pending = await prisma.teacherLeave.count({
      where: { status: "PENDING" },
    });
    const approved = await prisma.teacherLeave.count({
      where: { status: "APPROVED" },
    });
    const rejected = await prisma.teacherLeave.count({
      where: { status: "REJECTED" },
    });

    // Get department statistics
    const departmentStats = await prisma.teacherLeave.groupBy({
      by: ["department"],
      _count: {
        id: true,
      },
    });

    // Get monthly statistics for the current year
    const currentYear = new Date().getFullYear();
    const monthlyStats = [];

    for (let month = 0; month < 12; month++) {
      const startDate = new Date(currentYear, month, 1);
      const endDate = endOfMonth(startDate);

      const count = await prisma.teacherLeave.count({
        where: {
          startDate: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      monthlyStats.push({
        month: month + 1,
        count,
      });
    }

    return {
      total,
      pending,
      approved,
      rejected,
      departmentStats,
      monthlyStats,
    };
  } catch (error) {
    console.error("Failed to get teacher leave stats:", error);
    return {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      departmentStats: [],
      monthlyStats: [],
    };
  }
}

// Get filtered teacher leaves for admin
export async function getFilteredTeacherLeaves(searchParams: {
  name?: string;
  department?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}) {
  // Check if user is admin

  try {
    // Build the where clause based on filters
    const where: any = {};

    if (searchParams.name) {
      where.name = {
        contains: searchParams.name,
        mode: "insensitive",
      };
    }

    if (searchParams.department) {
      where.department = searchParams.department;
    }

    if (searchParams.status) {
      where.status = searchParams.status;
    }

    // Date filters
    if (searchParams.startDate || searchParams.endDate) {
      where.OR = [];

      if (searchParams.startDate && searchParams.endDate) {
        // Find leaves that overlap with the selected date range
        where.OR.push({
          startDate: {
            lte: parseISO(searchParams.endDate),
          },
          endDate: {
            gte: parseISO(searchParams.startDate),
          },
        });
      } else if (searchParams.startDate) {
        where.startDate = {
          gte: parseISO(searchParams.startDate),
        };
      } else if (searchParams.endDate) {
        where.endDate = {
          lte: parseISO(searchParams.endDate),
        };
      }
    }

    // Get the leaves with filters
    const leaves = await prisma.teacherLeave.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return leaves;
  } catch (error) {
    console.error("Failed to get filtered teacher leaves:", error);
    return [];
  }
}

// Update leave status with feedback
export async function updateLeaveStatusWithFeedback(formData: FormData) {
  // Check if user is admin

  const id = formData.get("id") as string;
  const status = formData.get("status") as string;
  const feedback = formData.get("feedback") as string;

  try {
    // Get the leave request
    const leave = await prisma.teacherLeave.findUnique({
      where: { id },
    });

    if (!leave) {
      throw new Error("Leave request not found");
    }

    // Update the leave status and add feedback
    await prisma.teacherLeave.update({
      where: { id },
      data: {
        status,
        feedback,
        // Store feedback in a notes field or similar
        // This would require adding a 'feedback' field to the TeacherLeave model
        // For now, we'll just update the status
      },
    });

    // Update user's leave statistics if the status is changing to APPROVED or REJECTED
    if (status === "APPROVED") {
      await prisma.user.update({
        where: { id: leave.userId },
        data: {
          totalLeavesApproved: { increment: 1 },
          totalLeavesTaken: { increment: leave.totalDays || 0 },
        },
      });
    } else if (status === "REJECTED") {
      await prisma.user.update({
        where: { id: leave.userId },
        data: {
          totalLeavesRejected: { increment: 1 },
        },
      });
    }

    revalidatePath("/ateacher-leave");
    return { success: true };
  } catch (error) {
    console.error("Failed to update leave status:", error);
    return { success: false, error };
  }
}

// Get teacher leave by ID
export async function getTeacherLeaveById(id: string) {
  // Check if user is admin

  try {
    const leave = await prisma.teacherLeave.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            department: true,
          },
        },
      },
    });

    return leave;
  } catch (error) {
    console.error("Failed to get teacher leave by ID:", error);
    return null;
  }
}
