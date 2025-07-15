"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { z } from "zod";

// const currentUtcTime = new Date();
// const indiaOffset = 330;

// const indiaTime = new Date(currentUtcTime.getTime() + indiaOffset * 60000);
const currentUtcTime = new Date();
const indiaOffset = 330;
const indiaTime = new Date(currentUtcTime.getTime() + indiaOffset * 60000);
const indianDateString = new Date().toLocaleDateString("en-CA", {
  timeZone: "Asia/Kolkata",
});

const formattedIndianDate = new Date(indianDateString);

const studentAbsenceSchema = z.object({
  id: z.string().optional(),
  rollNo: z.string().min(1),
  studentName: z.string().min(1),
  class: z.string().min(1),
  standard: z.string().min(1).optional(),
  parentName: z.string().min(1),
  reason: z.string().min(1),
  status: z
    .enum(["PENDING", "APPROVED", "REJECTED", "DONE"])
    .default("PENDING"),
  photo: z.string().optional(),
});

export async function getStudentAbsences(date: Date) {
  try {
    // Create date range for the given month and year
    // const startDate = new Date(year, month - 1, 1);
    // const endDate = new Date(year, month, 0);
    console.log("GetStudentAbsences", date);

    let targetDate: Date;

    if (date) {
      targetDate = new Date(date);
     
      
    } else {
      const indianDateString = new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
      });
      targetDate = new Date(indianDateString);
      
      
    }
 
    

    const absences = await prisma.studentLeave.findMany({
      where: {
        date: targetDate,
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
        photo: true,
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
    console.log("validatedData",validatedData);


   const absence = await prisma.studentLeave.create({
      data: {
        date: formattedIndianDate,
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
    console.log("date",formattedIndianDate);
    

    revalidatePath("/student-absent");
    revalidatePath("/security");
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

    const updateData: {
      rollNo: string;
      studentName: string;
      class: string;
      standard: string;
      parentName: string;
      purpose: string;
      status: "PENDING" | "APPROVED" | "REJECTED" | "DONE";
      photo?: string;
      outTime?: Date;
    } = {
      rollNo: validatedData.rollNo,
      studentName: validatedData.studentName,
      class: validatedData.class,
      standard: validatedData.standard,
      parentName: validatedData.parentName,
      purpose: validatedData.reason,
      status: validatedData.status,
      photo: validatedData.photo,
      outTime: indiaTime,
    };

    // Add outTime only when status is changed to DONE
    if (validatedData.status === "DONE") {
      updateData.outTime = indiaTime;
    }

    const absence = await prisma.studentLeave.update({
      where: { id: validatedData.id },
      data: updateData,
    });

    revalidatePath("/student-absent");
    revalidatePath("/security");
    return absence;
  } catch (error) {
    console.error("Failed to update student absence:", error);
    throw new Error("Failed to update student absence");
  }
}

export async function deleteStudentAbsence(id: string) {
  console.log("DeleteStudentAbsence", id);

  try {
    await prisma.studentLeave.delete({
      where: {
        id,
      },
    });

    revalidatePath("/student-absent");
    revalidatePath("/security");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete student absence:", error);
    throw new Error("Failed to delete student absence");
  }
}
