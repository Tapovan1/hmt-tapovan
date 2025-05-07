"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";
import { getUser } from "./getUser";

export async function getTeacherLeaves(month: number, year: number) {
  const startDate = startOfMonth(new Date(year, month - 1));
  const endDate = endOfMonth(new Date(year, month - 1));

  try {
    const leaves = await prisma.teacherLeave.findMany({
      where: {
        OR: [
          {
            startDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            endDate: {
              gte: startDate,
              lte: endDate,
            },
          },
        ],
      },
      orderBy: {
        startDate: "desc",
      },
    });

    return leaves;
  } catch (error) {
    console.error("Failed to fetch teacher leaves:", error);
    return [];
  }
}

interface TeacherLeaveData {
  startDate: Date;
  endDate: Date;
  reason: string;
}

export async function createTeacherLeave(data: TeacherLeaveData) {
  const user = await getUser();
  try {
    if (!user?.id) {
      throw new Error("User ID is required to create a teacher leave.");
    }

    await prisma.teacherLeave.create({
      data: {
        userId: user.id,
        name: user.name ?? "Unknown",
        department: user.department ?? "Unknown",
        startDate: data.startDate,
        endDate: data.endDate,
        reason: data.reason,
        status: "Pending",
      },
    });

    revalidatePath("/teacher-leaves");
    return { success: true };
  } catch (error) {
    console.error("Failed to create teacher leave:", error);
    return { success: false, error };
  }
}

interface UpdateTeacherLeaveData {
  id: string;
  userId: string;
  name: string;
  department: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: string;
}

export async function updateTeacherLeave(data: UpdateTeacherLeaveData) {
  try {
    await prisma.teacherLeave.update({
      where: {
        id: data.id,
      },
      data: {
        userId: data.userId,
        name: data.name,
        department: data.department,
        startDate: data.startDate,
        endDate: data.endDate,
        reason: data.reason,
        status: data.status,
      },
    });

    revalidatePath("/teacher-leaves");
    return { success: true };
  } catch (error) {
    console.error("Failed to update teacher leave:", error);
    return { success: false, error };
  }
}

export async function updateLeaveStatus(formData: FormData) {
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;

  try {
    await prisma.teacherLeave.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });

    revalidatePath("/teacher-leaves");
    return { success: true };
  } catch (error) {
    console.error("Failed to update leave status:", error);
    return { success: false, error };
  }
}

export async function deleteTeacherLeave(id: string) {
  console.log("Deleting teacher leave with ID:", id);

  try {
    await prisma.teacherLeave.delete({
      where: {
        id,
      },
    });

    revalidatePath("/teacher-leaves");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete teacher leave:", error);
    return { success: false, error };
  }
}
