"use server";

import prisma from "@/lib/prisma";
import { Status } from "@prisma/client";
import { isTeacherOnLeave } from "./teacherLeave.action";
import { getUser } from "./getUser";
import { getSchedulesByDepartment } from "./work-schedule";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";

const currentUtcTime = new Date();

const formattedIndianDate = new Date(format(currentUtcTime, "yyyy-MM-dd"));

export const getAttendance = async (user: { id: string }) => {
  const attendance = await prisma.attendance.findFirst({
    where: {
      userId: user.id,
      date: new Date(),
    },

    select: {
      checkIn: true,
      checkOut: true,
      status: true,
    },
  });

  if (!attendance) {
    return null;
  }

  return {
    ...attendance,
    checkIn: attendance.checkIn?.toISOString(),
    checkOut: attendance.checkOut?.toISOString(),
    status: attendance.status,
  };
};

export async function markAttendance(formData: FormData) {
  try {
    const user = await getUser();
    const currentUtcTime = new Date();
    const indiaOffset = 330;

    const indiaTime = new Date(currentUtcTime.getTime() + indiaOffset * 60000);
    if (!user) {
      return { success: false, error: "User not found" };
    }
    const action = formData.get("action") as string;
    const photo = formData.get("photo") as string;

    const scheduleId = formData.get("scheduleId") as string;

    // Get today's date with time set to 00:00:00
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if the teacher is on approved leave today
    const isOnLeave = await isTeacherOnLeave(user.id, today);

    if (isOnLeave) {
      return {
        success: false,
        error: "You are on approved leave today and cannot mark attendance.",
        isOnLeave: true,
      };
    }

    // If not on leave, proceed with normal attendance marking
    let attendance = await prisma.attendance.findFirst({
      where: {
        userId: user.id,
        date: formattedIndianDate,
      },
    });

    if (!attendance) {
      // Create new attendance record
      attendance = await prisma.attendance.create({
        data: {
          userId: user.id,
          date: formattedIndianDate,
          checkIn: action === "checkIn" ? indiaTime : undefined,
          checkOut: action === "checkOut" ? indiaTime : undefined,
          status: Status.PRESENT,
          photo: photo || undefined,
          scheduleId: scheduleId || undefined,
        },
      });
    } else {
      // Update existing attendance record
      attendance = await prisma.attendance.update({
        where: { id: attendance.id },
        data: {
          checkIn: action === "checkIn" ? indiaTime : attendance.checkIn,
          checkOut: action === "checkOut" ? indiaTime : attendance.checkOut,
          photo: photo || attendance.photo,
        },
      });
    }
    revalidatePath("/attendance");
    revalidatePath("/dashboard");
    revalidatePath("/history");

    return { success: true, data: attendance };
  } catch (error) {
    console.error("Error marking attendance:", error);
    return { success: false, error: "Failed to mark attendance" };
  }
}

export async function validateLocation(latitude: number, longitude: number) {
  try {
    const user = await getUser();

    if (!user?.department) {
      return {
        success: false,
        message: "Department is required to validate location",
      };
    }

    // Get schedule for the department
    const schedule = await getSchedulesByDepartment(user.department);

    if (!schedule) {
      return {
        success: false,
        message: "No schedule found for your department",
      };
    }

    // Check if location settings are configured
    if (!schedule.latitude || !schedule.longitude) {
      return {
        success: false,
        message: "Location settings not configured for your department",
      };
    }

    const allowedRadius = schedule.locationRadius || 0.1; // Default radius is 0.1 km if not specified

    // Calculate distance between user's location and allowed location
    const distance = calculateDistance(
      latitude,
      longitude,
      schedule.latitude,
      schedule.longitude
    );

    // If distance is within allowed radius, allow attendance
    const isWithinRange = distance <= allowedRadius;

    return {
      success: isWithinRange,
      message: isWithinRange
        ? "Location validated successfully"
        : `You are not within the allowed location range (${(
            distance * 1000
          ).toFixed(0)}m away, max ${(allowedRadius * 1000).toFixed(0)}m)`,
      distance: distance,
      allowedRadius: allowedRadius,
    };
  } catch (error) {
    console.error("Location validation error:", error);
    return {
      success: false,
      message: "An error occurred during location validation",
    };
  }
}

// Helper function to calculate distance between two points
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
