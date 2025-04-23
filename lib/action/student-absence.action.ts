"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { z } from "zod";

const currentUtcTime = new Date();
const indiaOffset = 330;

const indiaTime = new Date(currentUtcTime.getTime() + indiaOffset * 60000);

const studentAbsenceSchema = z.object({
  id: z.string().optional(),

  rollNo: z.string().min(1),
  studentName: z.string().min(1),
  class: z.string().min(1),
  standard: z.string().min(1),
  parentName: z.string().min(1),
  reason: z.string().min(1),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).default("PENDING"),
  photo: z.string().optional(), // Add this line for the photo
});

export async function getStudentAbsences(month: number, year: number) {
  try {
    // Create date range for the given month and year
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const absences = await prisma.studentLeave.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: "desc",
      },
      select: {
        id: true,
        date: true,
        rollNo: true,
        studentName: true,
        class: true,
        standard: true,
        parentName: true,
        purpose: true,
        outTime: true,
        status: true,
      },
    });

    return absences;
  } catch (error) {
    console.error("Failed to fetch student absences:", error);
    return [];
  }
}

export async function getStudentAbsenceById(id: string) {
  try {
    const absence = await prisma.studentLeave.findUnique({
      where: { id },
    });

    return absence;
  } catch (error) {
    console.error("Failed to fetch student absence:", error);
    return null;
  }
}

export async function createStudentAbsence(
  data: z.infer<typeof studentAbsenceSchema>
) {
  try {
    const validatedData = studentAbsenceSchema.parse(data);

    const absence = await prisma.studentLeave.create({
      data: {
        date: indiaTime, // Use the ISO 8601 formatted date
        rollNo: validatedData.rollNo,
        studentName: validatedData.studentName,
        class: validatedData.class,
        standard: validatedData.standard,
        parentName: validatedData.parentName,
        purpose: validatedData.reason,
        status: validatedData.status,
        photo: validatedData.photo,
      },
    });

    revalidatePath("/student-absent");
    return absence;
  } catch (error) {
    console.error("Failed to create student absence:", error);
    throw new Error("Failed to create student absence");
  }
}

export async function updateStudentAbsence(
  data: z.infer<typeof studentAbsenceSchema>
) {
  try {
    const validatedData = studentAbsenceSchema.parse(data);

    if (!validatedData.id) {
      throw new Error("Student absence ID is required for updates");
    }

    const absence = await prisma.studentLeave.update({
      where: { id: validatedData.id },
      data: {
        date: indiaTime,
        rollNo: validatedData.rollNo,
        studentName: validatedData.studentName,
        class: validatedData.class,
        standard: validatedData.standard,
        parentName: validatedData.parentName,
        purpose: validatedData.reason,
        status: validatedData.status,
        photo: validatedData.photo, // Add this line
      },
    });

    revalidatePath("/student-absent");
    return absence;
  } catch (error) {
    console.error("Failed to update student absence:", error);
    throw new Error("Failed to update student absence");
  }
}

export async function deleteStudentAbsence(id: string) {
  try {
    await prisma.studentLeave.delete({
      where: { id },
    });

    revalidatePath("/student-absent");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete student absence:", error);
    throw new Error("Failed to delete student absence");
  }
}
