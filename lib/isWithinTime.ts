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
  // const day = now.getDay();
  // const isSaturday = day === 6;

  // // If today is not a working day, return false
  // if (!schedule.workDays.includes(day)) {
  //   console.log(`[Attendance] Not a working day. Current day: ${day}`);
  //   return false;
  // }

  // // Use Saturday timing if today is Saturday
  // const activeStartTime =
  //   isSaturday && schedule.saturdayStartTime
  //     ? schedule.saturdayStartTime
  //     : schedule.startTime;

  // // Convert current time to minutes
  // const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // // Convert schedule start time to minutes
  // const [startHour, startMinute] = activeStartTime.split(":").map(Number);
  // const scheduleStartMinutes = startHour * 60 + startMinute;

  // // ✅ Only check if current time is after or equal to start time
  // // const isAfterStart = currentMinutes >= scheduleStartMinutes;

  return true;
}
