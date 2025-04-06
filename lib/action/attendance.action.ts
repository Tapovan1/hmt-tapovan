"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getUser } from "./getUser";

import { format } from "date-fns";
import { determineStatus } from "../attendance";
import { getSchedulesByDepartment } from "./work-schedule";

const currentUtcTime = new Date();

const formattedIndianDate = new Date(format(currentUtcTime, "yyyy-MM-dd"));

export const getWorkSchedule = async () => {
  // Fallback to global schedule
  const globalSchedule = await prisma.workSchedule.findFirst({
    where: { isGlobal: true },
  });

  if (!globalSchedule) {
    throw new Error("No work schedule found");
  }

  return globalSchedule;
};

export async function markAttendance(data: {
  photo: string;
  latitude: number;
  longitude: number;
}) {
  const user = await getUser();

  const currentUtcTime = new Date();
  const indiaOffset = 330;

  const indiaTime = new Date(currentUtcTime.getTime() + indiaOffset * 60000);

  const existingAttendance = await prisma.attendance.findFirst({
    where: {
      userId: user?.id,
      date: currentUtcTime,
    },
  });

  if (existingAttendance) {
    return {
      sucess: false,
      message: "Attendance already marked for the day",
    };
  }

  if (!user?.department) {
    throw new Error("Department is required to mark attendance");
  }

  const schedule = await getSchedulesByDepartment(user.department);

  if (!schedule) {
    throw new Error("No schedule found for the department");
  }

  await prisma.attendance.create({
    data: {
      userId: user.id,

      date: formattedIndianDate,
      checkIn: indiaTime,
      photo: data.photo,
      status: determineStatus(indiaTime, schedule),
    },
  });

  revalidatePath("/attendance");
  revalidatePath("/dashboard");
  revalidatePath("/history");

  return {
    sucess: true,
    message: "Attendance marked successfully",
  };
}

export async function markCheckOut(data: {
  photo: string;
  latitude: number;
  longitude: number;
}) {
  const user = await getUser();

  const currentUtcTime = new Date();
  const indiaOffset = 330;

  const indiaTime = new Date(currentUtcTime.getTime() + indiaOffset * 60000);

  const existingAttendance = await prisma.attendance.findFirst({
    where: {
      userId: user?.id,
      date: currentUtcTime,
    },
  });

  if (!existingAttendance) {
    return {
      sucess: false,
      message: "Attendance not marked for the day",
    };
  }

  if (existingAttendance.checkOut) {
    return {
      sucess: false,
      message: "Check-out already marked for the day",
    };
  }

  await prisma.attendance.update({
    where: {
      id: existingAttendance.id,
    },
    data: {
      checkOut: indiaTime,
      photo: data.photo,

      // status: determineStatus(indiaTime, schedule),
    },
  });

  revalidatePath("/attendance");
  revalidatePath("/dashboard");
  revalidatePath("/history");

  return {
    sucess: true,
    message: "Check-out marked successfully",
  };
}
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
