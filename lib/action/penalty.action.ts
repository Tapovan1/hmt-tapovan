"use server";

import prisma from "@/lib/prisma";

interface PenaltyParams {
  userId: string;
  employeeName: string;
  department: string;
  amount: number;

  month: string; // Format: "2025-01"
}

interface GetPenaltiesParams {
  userId?: string;
  department?: string;
  month: string; // Format: "2025-01"
}

// Helper function to get month string from date

export async function saveEmployeePenalty(params: PenaltyParams) {
  try {
    // Validate input
    if (params.amount < 0) {
      throw new Error("Penalty amount cannot be negative");
    }

    //     if (params.amount > 0) {
    //       throw new Error("Reason is required for penalties greater than 0");
    //     }

    //     console.log("Saving penalty for month:", params.month);

    // Upsert penalty (update if exists, create if not)
    const penalty = await prisma.employeePenalty.upsert({
      where: {
        userId_month: {
          userId: params.userId,
          month: params.month,
        },
      },
      update: {
        amount: params.amount,

        employeeName: params.employeeName,
        department: params.department,
        updatedAt: new Date(),
      },
      create: {
        userId: params.userId,
        employeeName: params.employeeName,
        department: params.department,
        amount: params.amount,

        month: params.month,
      },
    });

    console.log("Penalty saved successfully:", penalty);
    return { success: true, penalty };
  } catch (error) {
    console.error("Error saving employee penalty:", error);
    throw new Error("Failed to save penalty");
  }
}

export async function getEmployeePenalties(params: GetPenaltiesParams) {
  try {
    //     console.log("Fetching penalties for month:", params.month);

    const penalties = await prisma.employeePenalty.findMany({
      where: {
        ...(params.userId && { userId: params.userId }),
        ...(params.department && { department: params.department }),
        month: params.month,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            department: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    //     console.log("Found penalties:", penalties.length);
    return penalties;
  } catch (error) {
    console.error("Error fetching employee penalties:", error);
    throw new Error("Failed to fetch penalties");
  }
}

// New function to get penalties for specific users in a month
export async function getPenaltiesForUsers(userIds: string[], month: string) {
  try {
    //     console.log(
    //       "Fetching penalties for users:",
    //       userIds.length,
    //       "in month:",
    //       month
    //     );

    const penalties = await prisma.employeePenalty.findMany({
      where: {
        userId: {
          in: userIds,
        },
        month: month,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            department: true,
          },
        },
      },
    });

    //     console.log("Found penalties for users:", penalties.length);
    return penalties;
  } catch (error) {
    console.error("Error fetching penalties for users:", error);
    return [];
  }
}

export async function getPenaltyByUserAndMonth(userId: string, month: string) {
  try {
    const penalty = await prisma.employeePenalty.findUnique({
      where: {
        userId_month: {
          userId,
          month,
        },
      },
    });

    return penalty;
  } catch (error) {
    console.error("Error fetching penalty:", error);
    return null;
  }
}

export async function deletePenalty(penaltyId: string) {
  try {
    await prisma.employeePenalty.delete({
      where: {
        id: penaltyId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting penalty:", error);
    throw new Error("Failed to delete penalty");
  }
}

export async function getPenaltyHistory(userId: string, limit = 10) {
  try {
    const penalties = await prisma.employeePenalty.findMany({
      where: {
        userId,
      },
      orderBy: {
        month: "desc",
      },
      take: limit,
    });

    return penalties;
  } catch (error) {
    console.error("Error fetching penalty history:", error);
    throw new Error("Failed to fetch penalty history");
  }
}

// Get all penalties for a specific month (for reports)
export async function getAllPenaltiesForMonth(
  month: string,
  department?: string
) {
  try {
    const whereClause: any = {
      month: month,
    };

    if (department) {
      whereClause.user = {
        department: department,
        NOT: {
          role: "SUPERADMIN",
        },
      };
    } else {
      whereClause.user = {
        NOT: {
          role: "SUPERADMIN",
        },
      };
    }

    const penalties = await prisma.employeePenalty.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            department: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return penalties;
  } catch (error) {
    console.error("Error fetching all penalties for month:", error);
    return [];
  }
}
