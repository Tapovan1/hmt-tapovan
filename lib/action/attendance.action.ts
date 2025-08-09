"use server";

import prisma from "@/lib/prisma";

import { isTeacherOnLeave } from "./teacherLeave.action";
import { getUser } from "./getUser";
import { getSchedulesByDepartment } from "./work-schedule";
// import { format } from "date-fns";
import { revalidatePath } from "next/cache";
import { determineStatus } from "../attendance";
import { calculateDistance, isWithinRadius } from "../utils/location-utils";
import { late } from "zod";

export const getAttendance = async (user: { id: string }) => {
  if (!user) {
    return null;
  }

  // Get today's date with time set to 00:00:00 asia/kolkata time zone
  const currentUtcTime = new Date();
  const indiaOffset = 330;
  const indiaTime = new Date(currentUtcTime.getTime() + indiaOffset * 60000);
  const indiaDateOnly = new Date(indiaTime);
  indiaDateOnly.setHours(0, 0, 0, 0);

  // console.log("indiaDateOnly", indiaDateOnly);
  const indianDateString = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });

  const formattedIndianDate = new Date(indianDateString);
  // console.log("formattedIndianDate", formattedIndianDate);

  const attendance = await prisma.attendance.findFirst({
    where: {
      userId: user.id,
      date: formattedIndianDate,
    },

    select: {
      checkIn: true,
      checkOut: true,
      status: true,
      late: true,
      early: true,
      overTime: true,
      date: true,
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
    late: attendance.late,
  };
};

export async function markAttendance(formData: FormData) {
  try {
    const user = await getUser();
    const currentUtcTime = new Date();
    const indiaOffset = 330;
    //need indianDate

    const indiaTime = new Date(currentUtcTime.getTime() + indiaOffset * 60000);
    const indiaDateOnly = new Date(indiaTime);
    indiaDateOnly.setHours(0, 0, 0, 0);
    // indiatme need date and ime 000000 need format ISO 9001 prisma
    const indianDateString = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    });

    const formattedIndianDate = new Date(indianDateString);

    // const formattedIndianDate = format(
    //   indiaTime,
    //   "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
    // );
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

    let attendance = await prisma.attendance.findFirst({
      where: {
        userId: user.id,
        date: formattedIndianDate,
      },
    });

    const schedule = await getSchedulesByDepartment(user.department);
    // console.log("schedule", schedule);

    if (!schedule) {
      return {
        success: false,
        error: "No schedule found for your department",
      };
    }

    let minutesLate = 0;
    let earlyExitMinutes = 0;
    let overtimeMinutes = 0;

    const isSaturday = indiaTime.getDay() === 6;

    // Select correct schedule based on the day
    const selectedSchedule = isSaturday
      ? {
          startTime: schedule.saturdayStartTime,
          endTime: schedule.saturdayEndTime,
          graceMinutes: schedule.saturdayGraceMinutes,
        }
      : {
          startTime: schedule?.startTime,
          endTime: schedule?.endTime,
          graceMinutes: schedule?.graceMinutes || 0,
        };

    // console.log("selectedSchedule", selectedSchedule);

    // If no schedule found, return error
    if (!selectedSchedule) {
      return {
        success: false,
        error: "No schedule found for your department",
      };
    }

    if (action === "checkIn" && selectedSchedule) {
      const indiaTime = new Date(
        new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
      );

      // Remove seconds & milliseconds from actual check-in
      indiaTime.setSeconds(0, 0);

      const today = new Date(indiaTime);
      today.setHours(0, 0, 0, 0);

      const expectedStartTime = new Date(today);
      const [startHour, startMinute] = (selectedSchedule.startTime ?? "00:00")
        .split(":")
        .map(Number);

      expectedStartTime.setHours(
        startHour,
        startMinute + (selectedSchedule.graceMinutes ?? 0),
        0,
        0
      );

      // Remove seconds & milliseconds from expected start time
      expectedStartTime.setSeconds(0, 0);

      const diff = (indiaTime.getTime() - expectedStartTime.getTime()) / 60000;
      minutesLate = diff > 0 ? Math.floor(diff) : 0; // floor to avoid fractional late minutes
      console.log("diff", diff);
    }

    console.log("late", late);

    // console.log("minutesLate", minutesLate);

    if (action === "checkOut" && selectedSchedule) {
      const indiaTime = new Date(
        new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
      );
      const today = new Date(indiaTime);
      today.setHours(0, 0, 0, 0);

      const expectedEndTime = new Date(today);
      const [endHour, endMinute] = (selectedSchedule.endTime ?? "00:00")
        .split(":")
        .map(Number);

      expectedEndTime.setHours(endHour, endMinute, 0, 0);

      const diff = (expectedEndTime.getTime() - indiaTime.getTime()) / 60000;

      if (diff > 0) {
        earlyExitMinutes = Math.round(diff);
      } else {
        overtimeMinutes = Math.abs(Math.round(diff)); // calculate overtime
      }
    }

    if (!schedule) {
      return {
        success: false,
        error: "No schedule found for your department",
      };
    }
    const status = determineStatus(indiaTime, {
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      graceMinutes: schedule.graceMinutes,
      saturdayStartTime: schedule.saturdayStartTime ?? undefined,
      saturdayEndTime: schedule.saturdayEndTime ?? undefined,
      saturdayGraceMinutes: schedule.saturdayGraceMinutes ?? undefined,
    });
    console.log("status", status);

    if (!attendance) {
      // Create new attendance record
      attendance = await prisma.attendance.create({
        data: {
          userId: user.id,
          date: formattedIndianDate,
          checkIn: action === "checkIn" ? indiaTime : undefined,
          checkOut: action === "checkOut" ? indiaTime : undefined,
          status: determineStatus(indiaTime, {
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            graceMinutes: schedule.graceMinutes,
            saturdayStartTime: schedule.saturdayStartTime ?? undefined,
            saturdayEndTime: schedule.saturdayEndTime ?? undefined,
            saturdayGraceMinutes: schedule.saturdayGraceMinutes ?? undefined,
          }),
          ...(minutesLate > 0 && { late: minutesLate }),
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
          ...(earlyExitMinutes > 0 && { early: earlyExitMinutes }),
          ...(overtimeMinutes > 0 && { overTime: overtimeMinutes }),
          photo: photo || attendance.photo,
        },
      });
    }
    revalidatePath("/attendance");
    revalidatePath("/dashboard");
    revalidatePath("/history");

    return { success: true, data: attendance };
  } catch (error) {
    console.log("err", error);

    console.error("Error marking attendance:", error);
    return { success: false, error: "Failed to mark attendance" };
  }
}

// Remove the existing calculateDistance and toRad functions since we're importing them

export async function validateLocation(
  accuracy: number,
  latitude: number,
  longitude: number
) {
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

    if (!schedule.locationRadius) {
      return {
        success: false,
        message: "Location radius not configured for your department",
      };
    }

    // Default radius is  (50m) if not specified
    const allowedRadius = schedule.locationRadius * 1000;

    // Use the utility function to check if within radius
    const isWithinRange = isWithinRadius(
      latitude,
      longitude,
      schedule.latitude,
      schedule.longitude,
      allowedRadius
    );

    // Calculate distance for the message
    const distance = calculateDistance(
      latitude,
      longitude,
      schedule.latitude,
      schedule.longitude
    );

    return {
      success: isWithinRange,
      message: isWithinRange
        ? "Location validated successfully"
        : `You are not within the allowed location range (${distance.toFixed(
            0
          )}m away, max ${allowedRadius.toFixed(
            0
          )}m) accuracy (${accuracy.toFixed(0)}m)`,
      distance: distance,
      isWithinRange: isWithinRange,
      allowedRadius: allowedRadius,
      coordinates: {
        user: { latitude, longitude },
        school: { latitude: schedule.latitude, longitude: schedule.longitude },
      },
    };
  } catch (error) {
    console.error("Location validation error:", error);
    return {
      success: false,
      message: "An error occurred during location validation",
    };
  }
}
