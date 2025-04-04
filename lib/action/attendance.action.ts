"use server";

import prisma from "@/lib/prisma";
import { revalidatePath, unstable_cache } from "next/cache";
import { getUser } from "./getUser";

import { format } from "date-fns";
import { determineStatus } from "../attendance";
import { getSchedulesByDepartment } from "./work-schedule";

const currentUtcTime = new Date();

const formattedIndianDate = new Date(format(currentUtcTime, "yyyy-MM-dd"));

export const getWorkSchedule = unstable_cache(
  async () => {
    // Fallback to global schedule
    const globalSchedule = await prisma.workSchedule.findFirst({
      where: { isGlobal: true },
    });

    if (!globalSchedule) {
      throw new Error("No work schedule found");
    }

    return globalSchedule;
  },
  ["workSchedule"],
  { revalidate: 86400 }
);

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
  const user = await getUser();

  if (!user?.department) {
    throw new Error("Department is required to validate location");
  }

  // Get allowed location from environment variables
  const allowedLocation = process.env.LOCATION;
  if (!allowedLocation) {
    return {
      success: false,
      message: "No location set for your department",
    };
  }

  // Parse the location from environment variable (format: "latitude,longitude,radius")
  const [allowedLat, allowedLon, radius] = allowedLocation
    .split(",")
    .map(Number);
  const allowedRadius = radius || 0.1; // Default radius is 0.1 km if not specified

  // Calculate distance between user's location and allowed location
  const distance = calculateDistance(
    latitude,
    longitude,
    allowedLat,
    allowedLon
  );

  // If distance is within allowed radius, allow attendance
  const isWithinRange = distance <= allowedRadius;

  return {
    success: isWithinRange,
    message: isWithinRange
      ? "Location validated successfully"
      : "You are not within the allowed location range",
  };
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
