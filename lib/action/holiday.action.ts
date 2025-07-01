"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma"; // Uncomment when you have Prisma setup
// import { getCurrentUser } from "@/lib/auth" // Uncomment when you have auth

export interface Holiday {
  id: string;
  name: string;
  date: Date;
  type: "NATIONAL" | "RELIGIOUS" | "SCHOOL" | "LOCAL";
  description?: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface CreateHolidayData {
  name: string;
  date: Date;
  type: "NATIONAL" | "RELIGIOUS" | "SCHOOL" | "LOCAL";
  description?: string;
}

export interface UpdateHolidayData extends CreateHolidayData {
  id: string;
}

// Get all holidays with optional filtering
export async function getHolidays(
  year?: number,
  month?: number,
  type?: string
): Promise<Holiday[]> {
  try {
    const whereClause: any = {};

    // Filter by year and month
    if (year || month) {
      const startDate = new Date(
        year || new Date().getFullYear(),
        month ? month - 1 : 0,
        1
      );
      const endDate = month
        ? new Date(year || new Date().getFullYear(), month, 0, 23, 59, 59, 999)
        : new Date(
            (year || new Date().getFullYear()) + 1,
            0,
            0,
            23,
            59,
            59,
            999
          );

      whereClause.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    // Filter by type
    if (type && type !== "all") {
      whereClause.type = type.toUpperCase();
    }

    const holidays = await prisma.holiday.findMany({
      where: whereClause,

      orderBy: {
        date: "asc",
      },
    });

    return holidays.map((h) => ({
      ...h,
      description: h.description === null ? undefined : h.description,
    }));
  } catch (error) {
    console.error("Error fetching holidays:", error);
    throw new Error("Failed to fetch holidays");
  }
}

// Create a new holiday
export async function createHoliday(
  data: CreateHolidayData
): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const existingHoliday = await prisma.holiday.findFirst({
      where: {
        AND: [
          {
            date: {
              gte: new Date(
                data.date.getFullYear(),
                data.date.getMonth(),
                data.date.getDate()
              ),
              lt: new Date(
                data.date.getFullYear(),
                data.date.getMonth(),
                data.date.getDate() + 1
              ),
            },
          },
          {
            name: {
              equals: data.name,
              mode: "insensitive",
            },
          },
        ],
      },
    });

    if (existingHoliday) {
      return {
        success: false,
        error: "A holiday with the same name already exists on this date",
      };
    }

    // Create the holiday
    await prisma.holiday.create({
      data: {
        name: data.name.trim(),
        date: data.date,
        type: data.type,
        description: data.description?.trim() || null,
      },
    });

    // Temporary fallback

    revalidatePath("/holidays");

    return {
      success: true,
      message: "Holiday created successfully",
    };
  } catch (error) {
    console.error("Error creating holiday:", error);
    return { success: false, error: "Failed to create holiday" };
  }
}

// Update an existing holiday
export async function updateHoliday(
  data: UpdateHolidayData
): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const existingHoliday = await prisma.holiday.findUnique({
      where: { id: data.id },
    });

    if (!existingHoliday) {
      return { success: false, error: "Holiday not found" };
    }

    // Check for duplicate holidays on the same date (excluding current holiday)
    const duplicateHoliday = await prisma.holiday.findFirst({
      where: {
        AND: [
          { id: { not: data.id } },
          {
            date: {
              gte: new Date(
                data.date.getFullYear(),
                data.date.getMonth(),
                data.date.getDate()
              ),
              lt: new Date(
                data.date.getFullYear(),
                data.date.getMonth(),
                data.date.getDate() + 1
              ),
            },
          },
          {
            name: {
              equals: data.name,
              mode: "insensitive",
            },
          },
        ],
      },
    });

    if (duplicateHoliday) {
      return {
        success: false,
        error: "A holiday with the same name already exists on this date",
      };
    }

    // Update the holiday
    await prisma.holiday.update({
      where: { id: data.id },
      data: {
        name: data.name.trim(),
        date: data.date,
        type: data.type,
        description: data.description?.trim() || null,

        updatedAt: new Date(),
      },
    });

    // Temporary fallback

    revalidatePath("/holidays");
    return {
      success: true,
      message: " Holiday updated successfully",
    };
  } catch (error) {
    console.error("Error updating holiday:", error);
    return { success: false, error: "Failed to update holiday" };
  }
}

// Delete a holiday
export async function deleteHoliday(
  id: string
): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const existingHoliday = await prisma.holiday.findUnique({
      where: { id },
    });

    if (!existingHoliday) {
      return { success: false, error: "Holiday not found" };
    }

    // Delete the holiday
    await prisma.holiday.delete({
      where: { id },
    });

    revalidatePath("/holidays");

    return {
      success: true,
      message: "Holiday deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting holiday:", error);
    return { success: false, error: "Failed to delete holiday" };
  }
}

// Check if a date is a holiday
export async function isHoliday(date: Date): Promise<boolean> {
  try {
    const startOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const endOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + 1
    );

    const holiday = await prisma.holiday.findFirst({
      where: {
        date: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });

    return !!holiday;
  } catch (error) {
    console.error("Error checking holiday:", error);
    return false;
  }
}

// Get upcoming holidays (next 30 days)
export async function getUpcomingHolidays(): Promise<Holiday[]> {
  try {
    // Real Prisma implementation
    /*
    const today = new Date()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(today.getDate() + 30)

    const holidays = await prisma.holiday.findMany({
      where: {
        date: {
          gte: today,
          lte: thirtyDaysFromNow,
        },
      },
      include: {
        createdBy: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
      take: 5,
    })

    return holidays
    */

    // Temporary fallback
    console.log("Upcoming holidays fetch attempted");
    return [];
  } catch (error) {
    console.error("Error fetching upcoming holidays:", error);
    return [];
  }
}

// Get holiday statistics
export async function getHolidayStats(): Promise<{
  total: number;
  national: number;
  religious: number;
  school: number;
  local: number;
  thisMonth: number;
}> {
  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    // Get all holidays for current year
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear + 1, 0, 0, 23, 59, 59, 999);

    const yearlyHolidays = await prisma.holiday.findMany({
      where: {
        date: {
          gte: yearStart,
          lte: yearEnd,
        },
      },
    });

    // Get holidays for current month
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(
      currentYear,
      currentMonth + 1,
      0,
      23,
      59,
      59,
      999
    );

    const monthlyHolidays = await prisma.holiday.findMany({
      where: {
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });

    return {
      total: yearlyHolidays.length,
      national: yearlyHolidays.filter((h) => h.type === "NATIONAL").length,
      religious: yearlyHolidays.filter((h) => h.type === "RELIGIOUS").length,
      school: yearlyHolidays.filter((h) => h.type === "SCHOOL").length,
      local: yearlyHolidays.filter((h) => h.type === "LOCAL").length,
      thisMonth: monthlyHolidays.length,
    };

    // Temporary fallback
    console.log("Holiday stats fetch attempted");
    return {
      total: 0,
      national: 0,
      religious: 0,
      school: 0,
      local: 0,
      thisMonth: 0,
    };
  } catch (error) {
    console.error("Error fetching holiday stats:", error);
    return {
      total: 0,
      national: 0,
      religious: 0,
      school: 0,
      local: 0,
      thisMonth: 0,
    };
  }
}

// Get holiday by date (useful for attendance checking)
export async function getHolidayByDate(date: Date): Promise<Holiday | null> {
  try {
    // Real Prisma implementation
    /*
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)

    const holiday = await prisma.holiday.findFirst({
      where: {
        date: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
      include: {
        createdBy: {
          select: {
            name: true,
          },
        },
      },
    })

    return holiday
    */

    // Temporary fallback
    console.log("Holiday by date fetch attempted for:", date);
    return null;
  } catch (error) {
    console.error("Error getting holiday by date:", error);
    return null;
  }
}

// Get holidays for a specific date range
export async function getHolidaysInRange(
  startDate: Date,
  endDate: Date
): Promise<Holiday[]> {
  try {
    // Real Prisma implementation
    /*
    const holidays = await prisma.holiday.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        createdBy: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    })

    return holidays
    */

    // Temporary fallback
    console.log("Holidays in range fetch attempted:", { startDate, endDate });
    return [];
  } catch (error) {
    console.error("Error fetching holidays in range:", error);
    return [];
  }
}

// Bulk create holidays (useful for importing standard holidays)
export async function bulkCreateHolidays(
  holidays: CreateHolidayData[]
): Promise<{
  success: boolean;
  created: number;
  errors: string[];
}> {
  try {
    // Get current user
    // const currentUser = await getCurrentUser()
    // if (!currentUser) {
    //   return { success: false, created: 0, errors: ["Unauthorized"] }
    // }

    // Real Prisma implementation
    /*
    const errors: string[] = []
    let created = 0

    for (const holidayData of holidays) {
      try {
        // Check for duplicates
        const existingHoliday = await prisma.holiday.findFirst({
          where: {
            AND: [
              {
                date: {
                  gte: new Date(holidayData.date.getFullYear(), holidayData.date.getMonth(), holidayData.date.getDate()),
                  lt: new Date(holidayData.date.getFullYear(), holidayData.date.getMonth(), holidayData.date.getDate() + 1),
                },
              },
              {
                name: {
                  equals: holidayData.name,
                  mode: 'insensitive',
                },
              },
            ],
          },
        })

        if (!existingHoliday) {
          await prisma.holiday.create({
            data: {
              name: holidayData.name.trim(),
              date: holidayData.date,
              type: holidayData.type,
              description: holidayData.description?.trim() || null,
              isRecurring: holidayData.isRecurring,
              createdById: currentUser.id,
            },
          })
          created++
        } else {
          errors.push(`Holiday "${holidayData.name}" already exists on ${holidayData.date.toDateString()}`)
        }
      } catch (error) {
        errors.push(`Failed to create holiday "${holidayData.name}": ${error}`)
      }
    }

    revalidatePath("/holidays")
    return { success: true, created, errors }
    */

    // Temporary fallback
    console.log(
      "Bulk holiday creation attempted:",
      holidays.length,
      "holidays"
    );
    return {
      success: false,
      created: 0,
      errors: ["Database not configured. Please set up Prisma connection."],
    };
  } catch (error) {
    console.error("Error bulk creating holidays:", error);
    return {
      success: false,
      created: 0,
      errors: ["Failed to bulk create holidays"],
    };
  }
}
