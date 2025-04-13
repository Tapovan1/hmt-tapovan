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
export async function getDefaultSchedule() {
  try {
    const defaultSchedule = await prisma.workSchedule.findFirst({
      where: { isDefault: true },
    });

    if (!defaultSchedule) {
      // Fallback to any global schedule if no default is set
      const globalSchedule = await prisma.workSchedule.findFirst({
        where: { isGlobal: true },
      });

      return globalSchedule;
    }

    return defaultSchedule;
  } catch (error) {
    console.error("Error fetching default schedule:", error);
    return null;
  }
}

// Get default schedule for a department
export async function getDefaultScheduleForDepartment(department: string) {
  try {
    // First try to find a department-specific default
    const departmentSchedule = await prisma.workSchedule.findFirst({
      where: {
        department,
        isDefault: true,
      },
    });

    if (departmentSchedule) {
      return departmentSchedule;
    }

    // Then try to find any schedule for this department
    const anyDepartmentSchedule = await prisma.workSchedule.findFirst({
      where: { department },
    });

    if (anyDepartmentSchedule) {
      return anyDepartmentSchedule;
    }

    // Finally, fall back to the global default
    return getDefaultSchedule();
  } catch (error) {
    console.error(
      `Error fetching default schedule for department ${department}:`,
      error
    );
    return getDefaultSchedule();
  }
}

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
  name: string;
  department?: string | null;
  startTime: string;
  endTime: string;
  workDays: number[];
  graceMinutes: number;
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
  name: string;
  department?: string | null;
  startTime: string;
  endTime: string;
  workDays: number[];
  graceMinutes: number;
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

    if (schedule?.isDefault) {
      return {
        success: false,
        error: "Cannot delete the default schedule",
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
export async function setDefaultSchedule(id: string) {
  try {
    // Get the schedule to check if it's department-specific
    const schedule = await prisma.workSchedule.findUnique({
      where: { id },
    });

    if (!schedule) {
      throw new Error("Schedule not found");
    }

    if (schedule.department) {
      // If department-specific, only unset defaults for this department
      await prisma.workSchedule.updateMany({
        where: {
          isDefault: true,
          department: schedule.department,
        },
        data: { isDefault: false },
      });
    } else {
      // If global, unset all defaults
      await prisma.workSchedule.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    // Set the new default
    await prisma.workSchedule.update({
      where: { id },
      data: { isDefault: true },
    });

    revalidatePath("/admin/settings");

    return {
      success: true,
    };
  } catch (error) {
    console.error(`Error setting default schedule ${id}:`, error);
    return {
      success: false,
      error: "Failed to set default schedule",
    };
  }
}

// For backward compatibility
export async function getGlobalSchedule() {
  return getDefaultSchedule();
}

// For backward compatibility
export async function updateGlobalSchedule(data: {
  startTime: string;
  endTime: string;
  workDays: number[];
  graceMinutes: number;
  isGlobal: boolean;
}) {
  try {
    const existingGlobal = await prisma.workSchedule.findFirst({
      where: { isGlobal: true },
    });

    if (existingGlobal) {
      return updateSchedule({
        ...data,
        id: existingGlobal.id,
        name: existingGlobal.name || "Global Schedule",
        department: existingGlobal.department,
      });
    } else {
      return createSchedule({
        ...data,
        name: "Global Schedule",
        department: null,
      });
    }
  } catch (error) {
    console.error("Error updating global schedule:", error);
    return {
      success: false,
      error: "Failed to update global schedule",
    };
  }
}
