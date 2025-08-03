interface WorkSchedule {
  startTime: string;
  endTime: string;
  graceMinutes: number;
  saturdayStartTime?: string;
  saturdayEndTime?: string;
  saturdayGraceMinutes?: number;
}

export function isAttendanceLate(
  workSchedule: WorkSchedule,
  attendanceType: "checkIn" | "checkOut"
): { isLate: boolean; lateMinutes: number } {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes

  let scheduleStartTime: string;
  let graceMinutes: number;

  // Determine schedule based on day
  if (currentDay === 6 && workSchedule.saturdayStartTime) {
    // Saturday
    scheduleStartTime = workSchedule.saturdayStartTime;
    graceMinutes =
      workSchedule.saturdayGraceMinutes || workSchedule.graceMinutes;
  } else {
    // Weekdays
    scheduleStartTime = workSchedule.startTime;
    graceMinutes = workSchedule.graceMinutes;
  }

  // Parse schedule time (assuming format "HH:MM")
  const [hours, minutes] = scheduleStartTime.split(":").map(Number);
  const scheduleTimeInMinutes = hours * 60 + minutes;
  const allowedTimeWithGrace = scheduleTimeInMinutes + graceMinutes;

  // For check-in, compare with start time + grace
  if (attendanceType === "checkIn") {
    if (currentTime > allowedTimeWithGrace) {
      const lateMinutes = currentTime - allowedTimeWithGrace;
      return { isLate: true, lateMinutes };
    }
  }

  return { isLate: false, lateMinutes: 0 };
}
