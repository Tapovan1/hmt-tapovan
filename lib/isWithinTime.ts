// //disbale time window
// export function isWithinAllowedTime(schedule: {
//   startTime: string;
//   endTime: string;
//   graceMinutes: number;
//   workDays: number[];
// }) {
//   const now = new Date();
//   const today = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

//   // Check if today is a valid workday
//   if (!schedule.workDays.includes(today)) {
//     console.log("Today is not a working day. Attendance disabled.");
//     return false;
//   }

//   const [startHour, startMinute] = schedule.startTime.split(":").map(Number);
//   const startTime = new Date(now);

//   startTime.setHours(startHour, startMinute, 0);

//   const [endHour, endMinute] = schedule.endTime.split(":").map(Number);
//   const endTime = new Date(now);

//   endTime.setHours(endHour, endMinute, 0);

//   const graceEndTime = new Date(endTime);
//   graceEndTime.setMinutes(graceEndTime.getMinutes() + schedule.graceMinutes);

//   console.log("now", now);
//   console.log("startTime", startTime);
//   console.log("endTime", endTime);
//   console.log("graceEndTime", graceEndTime);

//   return now >= startTime && now <= graceEndTime;
// }

// Helper function to test with dummy data

// Create a mock date for Saturday

import { WorkSchedule } from "@/lib/types/work-schedule";

export function isWithinAllowedTime(schedule: WorkSchedule, now = new Date()) {
  // Get current day and check if it's Saturday
  const day = now.getDay();
  const isSaturday = day === 6;
  // const isSaturday = true;

  // Check if it's a working day
  if (!schedule.workDays.includes(day)) {
    console.log(`[Attendance] Not a working day. Current day: ${day}`);
    return false;
  }

  // Determine which schedule to use (Saturday or regular)
  const activeStartTime =
    isSaturday && schedule.saturdayStartTime
      ? schedule.saturdayStartTime
      : schedule.startTime;

  const activeEndTime =
    isSaturday && schedule.saturdayEndTime
      ? schedule.saturdayEndTime
      : schedule.endTime;

  // Convert current time to minutes
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Convert schedule times to minutes
  const [startHour, startMinute] = activeStartTime.split(":").map(Number);
  const [endHour, endMinute] = activeEndTime.split(":").map(Number);
  const scheduleStartMinutes = startHour * 60 + startMinute;
  const scheduleEndMinutes = endHour * 60 + endMinute;

  // Check if current time is within schedule
  const isWithinSchedule =
    currentMinutes >= scheduleStartMinutes &&
    currentMinutes <= scheduleEndMinutes;

  // Log attendance check details
  console.log("[Attendance] Time Check:", {
    currentTime: `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`,
    isSaturday,
    schedule: isSaturday ? "Saturday" : "Regular",
    allowedStart: activeStartTime,
    allowedEnd: activeEndTime,
    status: isWithinSchedule ? "Within Schedule" : "Outside Schedule",
  });

  return isWithinSchedule;
}
