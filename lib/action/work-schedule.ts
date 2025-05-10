"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Get all unique departments from users
export async function getDepartments() {
  try {
    const users = await prisma.user.findMany({
      select: {
        department: true,
      },
      distinct: ["department"],
    });

    return users
      .map((user) => user.department)
      .filter(Boolean)
      .sort();
  } catch (error) {
    console.error("Error fetching departments:", error);
    return [];
  }
}

// Get schedules by department
export const getSchedulesByDepartment = async (department: string) => {
  // Find department-specific schedule
  const departmentSchedule = await prisma.workSchedule.findFirst({
    where: {
      department,
    },
  });
  // console.log("departmentSchedule", departmentSchedule);

  return departmentSchedule;
};

// Get all schedules
export async function getGlobalSchedules() {
  try {
    const schedules = await prisma.workSchedule.findMany({
      orderBy: { createdAt: "asc" },
    });

    return schedules;
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return [];
  }
}

// Get default schedule

// Get schedule by ID
export async function getScheduleById(id: string) {
  try {
    const schedule = await prisma.workSchedule.findUnique({
      where: { id },
    });

    return schedule;
  } catch (error) {
    console.error(`Error fetching schedule ${id}:`, error);
    return null;
  }
}

// Create a new schedule
export async function createSchedule(data: {
  department?: string | null;
  startTime: string;
  endTime: string;
  workDays: number[];
  graceMinutes: number;
  absentAutomation?: boolean;
  saturdayStartTime?: string | null;
  saturdayEndTime?: string | null;
  saturdayGraceMinutes?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  locationRadius?: number | null;
}) {
  try {
    const schedule = await prisma.workSchedule.create({
      data: {
        ...data,
      },
    });

    revalidatePath("/settings");

    return {
      success: true,
      data: schedule,
    };
  } catch (error) {
    console.error("Error creating schedule:", error);
    return {
      success: false,
      error: "Failed to create schedule",
    };
  }
}

// Update an existing schedule
export async function updateSchedule(data: {
  id: string;

  department?: string | null;
  startTime: string;
  endTime: string;
  workDays: number[];
  graceMinutes: number;
  absentAutomation?: boolean;
  saturdayStartTime?: string | null;
  saturdayEndTime?: string | null;
  saturdayGraceMinutes?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  locationRadius?: number | null;
}) {
  try {
    const { id, ...updateData } = data;

    // Verify the schedule exists
    const existingSchedule = await prisma.workSchedule.findUnique({
      where: { id },
    });

    if (!existingSchedule) {
      return {
        success: false,
        error: "Schedule not found",
      };
    }

    const schedule = await prisma.workSchedule.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/settings");

    return {
      success: true,
      data: schedule,
    };
  } catch (error) {
    console.error(`Error updating schedule ${data.id}:`, error);
    return {
      success: false,
      error: "Failed to update schedule",
    };
  }
}

// Delete a schedule
export async function deleteSchedule(id: string) {
  console.log("Deleting schedule", id);

  try {
    // Check if this is the default schedule
    const schedule = await prisma.workSchedule.findUnique({
      where: { id },
    });

    if (!schedule) {
      return {
        success: false,
        error: "Schedule not found",
      };
    }

    // Update any users or attendances that reference this schedule
    await prisma.user.updateMany({
      where: { scheduleId: id },
      data: { scheduleId: null },
    });

    await prisma.attendance.updateMany({
      where: { scheduleId: id },
      data: { scheduleId: null },
    });

    // Delete the schedule
    await prisma.workSchedule.delete({
      where: { id },
    });

    console.log("Deleted schedule", id);

    revalidatePath("/settings");

    return {
      success: true,
    };
  } catch (error) {
    console.error(`Error deleting schedule ${id}:`, error);
    return {
      success: false,
      error: "Failed to delete schedule",
    };
  }
}

// Set a schedule as the default

// For backward compatibility
