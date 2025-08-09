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
  const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes(); // Minutes only

  let targetTimeInMinutes: number;
  let graceMinutes: number;

  if (attendanceType === "checkIn") {
    // --- START TIME ---
    if (currentDay === 6 && workSchedule.saturdayStartTime) {
      const [h, m] = workSchedule.saturdayStartTime.split(":").map(Number);
      graceMinutes =
        workSchedule.saturdayGraceMinutes ?? workSchedule.graceMinutes;
      targetTimeInMinutes = h * 60 + m + graceMinutes;
    } else {
      const [h, m] = workSchedule.startTime.split(":").map(Number);
      graceMinutes = workSchedule.graceMinutes;
      targetTimeInMinutes = h * 60 + m + graceMinutes;
    }

    if (currentTimeInMinutes > targetTimeInMinutes) {
      return {
        isLate: true,
        lateMinutes: currentTimeInMinutes - targetTimeInMinutes,
      };
    }
  }

  if (attendanceType === "checkOut") {
    // --- END TIME ---
    if (currentDay === 6 && workSchedule.saturdayEndTime) {
      const [h, m] = workSchedule.saturdayEndTime.split(":").map(Number);
      targetTimeInMinutes = h * 60 + m;
    } else {
      const [h, m] = workSchedule.endTime.split(":").map(Number);
      targetTimeInMinutes = h * 60 + m;
    }

    // If checking out before target time, mark as "early" (negative overtime)
    if (currentTimeInMinutes < targetTimeInMinutes) {
      return {
        isLate: true, // true here means "not on time" for checkOut
        lateMinutes: targetTimeInMinutes - currentTimeInMinutes, // early minutes
      };
    }
  }

  return { isLate: false, lateMinutes: 0 };
}
