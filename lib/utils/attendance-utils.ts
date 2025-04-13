import { WorkSchedule } from "@prisma/client";
import { formatIndianTime, formatTimeTo12Hour } from "./date-format";

export interface TimeStatus {
  isLate: boolean;
  minutesLate: number;
  status: "PRESENT" | "LATE" | "ABSENT";
}

function convertToIndianTime(date: Date): Date {
  // Create a date string in Indian timezone
  const indianTime = new Date(date.getTime() + 330 * 60000); // UTC+5:30 offset
  return indianTime;
}

function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

export function calculateAttendanceStatus(
  checkInTime: Date | null,
  schedule: WorkSchedule | null
): TimeStatus {
  //   console.log("\n=== Starting Attendance Calculation ===");

  // Show times in both 24-hour and 12-hour formats for easier debugging
  if (checkInTime) {
    //     console.log("Original Check-in time (UTC):", {
    //       "24hr": checkInTime.toLocaleString(),
    //       "12hr": formatIndianTime(checkInTime.toISOString()),
    //     });
  }

  // Convert check-in time to Indian timezone
  const indianCheckInTime = checkInTime
    ? convertToIndianTime(checkInTime)
    : null;

  if (indianCheckInTime) {
    //     console.log("Indian Check-in time (UTC+5:30):", {
    //       "24hr": indianCheckInTime.toLocaleString(),
    //       "12hr": formatIndianTime(indianCheckInTime.toISOString()),
    //     });
  }

  //   console.log("Schedule:", {
  //     startTime: schedule?.startTime
  //       ? {
  //           "24hr": schedule.startTime,
  //           "12hr": formatTimeTo12Hour(schedule.startTime),
  //         }
  //       : null,
  //     saturdayStartTime: schedule?.saturdayStartTime
  //       ? {
  //           "24hr": schedule.saturdayStartTime,
  //           "12hr": formatTimeTo12Hour(schedule.saturdayStartTime),
  //         }
  //       : null,
  //     graceMinutes: schedule?.graceMinutes,
  //     saturdayGraceMinutes: schedule?.saturdayGraceMinutes,
  //   });

  if (!indianCheckInTime || !schedule) {
    //     console.log("No check-in time or schedule provided, marking as ABSENT");
    return {
      isLate: false,
      minutesLate: 0,
      status: "ABSENT",
    };
  }

  // Get day of week (0 = Sunday, 6 = Saturday)
  const dayOfWeek = indianCheckInTime.getDay();
  //   console.log("Day of week:", dayOfWeek, "(0=Sunday, 6=Saturday)");

  // Return absent for Sundays
  if (dayOfWeek === 0) {
    //     console.log("Sunday detected, marking as ABSENT");
    return {
      isLate: false,
      minutesLate: 0,
      status: "ABSENT",
    };
  }

  // Get expected check-in time and grace period based on day
  let expectedTime: string;
  let graceMinutes: number;

  if (dayOfWeek === 6 && schedule.saturdayStartTime) {
    // Saturday
    expectedTime = schedule.saturdayStartTime;
    graceMinutes = schedule.saturdayGraceMinutes || 0;
    //     console.log("Using Saturday schedule:", {
    //       expectedTime: {
    //         "24hr": expectedTime,
    //         "12hr": formatTimeTo12Hour(expectedTime),
    //       },
    //       graceMinutes,
    //     });
  } else {
    expectedTime = schedule.startTime;
    graceMinutes = schedule.graceMinutes;
    //     console.log("Using regular schedule:", {
    //       expectedTime: {
    //         "24hr": expectedTime,
    //         "12hr": formatTimeTo12Hour(expectedTime),
    //       },
    //       graceMinutes,
    //     });
  }

  // Calculate minutes since start of day for both times
  const checkInMinutes =
    indianCheckInTime.getHours() * 60 + indianCheckInTime.getMinutes();
  const expectedMinutes = parseTimeToMinutes(expectedTime);
  const graceEndMinutes = expectedMinutes + graceMinutes;

  //   console.log("Time comparison (in minutes from day start):", {
  //     checkIn: {
  //       minutes: checkInMinutes,
  //       formatted: formatTime(checkInMinutes),
  //     },
  //     expected: {
  //       minutes: expectedMinutes,
  //       formatted: formatTime(expectedMinutes),
  //     },
  //     graceEnd: {
  //       minutes: graceEndMinutes,
  //       formatted: formatTime(graceEndMinutes),
  //     },
  //   });

  // Calculate minutes late only if check-in is after grace period
  let minutesLate = 0;
  if (checkInMinutes > graceEndMinutes) {
    minutesLate = checkInMinutes - expectedMinutes; // Calculate from expected time, not grace end
    //     console.log("Late by minutes:", minutesLate);
  } else {
    //     console.log("Check-in is within grace period, not late");
  }

  const result: TimeStatus = {
    isLate: minutesLate > 0,
    minutesLate,
    status: minutesLate > 0 ? "LATE" : "PRESENT",
  };

  //   console.log("Final result:", result);
  //   console.log("=== End Attendance Calculation ===\n");

  return result;
}

export function isWorkingDay(date: Date, schedule: WorkSchedule): boolean {
  const indianDate = convertToIndianTime(date);
  const dayOfWeek = indianDate.getDay();

  // Sunday is never a working day
  if (dayOfWeek === 0) return false;

  // Check if the day is in workDays array
  return schedule.workDays.includes(dayOfWeek);
}

export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours >= 12 ? "PM" : "AM";
  const twelveHourFormat = hours % 12 || 12;
  return `${twelveHourFormat}:${mins.toString().padStart(2, "0")} ${period}`;
}
