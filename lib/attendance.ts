function convertScheduleToDate(
  schedule: { startTime: string; endTime: string },
  baseDate: string | Date
) {
  const date = new Date(baseDate);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  const startDateTime = new Date(
    `${year}-${month}-${day}T${schedule.startTime}:00.000Z`
  );
  const endDateTime = new Date(
    `${year}-${month}-${day}T${schedule.endTime}:00.000Z`
  );

  return {
    startDateTime: startDateTime,
    endDateTime: endDateTime,
  };
}

export function determineStatus(
  now: Date,
  schedule: {
    startTime: string;
    endTime: string;
    graceMinutes: number;
    saturdayStartTime?: string;
    saturdayEndTime?: string;
    saturdayGraceMinutes?: number;
  }
) {
  const isSaturday = now.getDay() === 6;

  // Select appropriate schedule based on the day
  const selectedSchedule =
    isSaturday &&
    schedule.saturdayStartTime &&
    schedule.saturdayEndTime &&
    typeof schedule.saturdayGraceMinutes === "number"
      ? {
          startTime: schedule.saturdayStartTime,
          endTime: schedule.saturdayEndTime,
          graceMinutes: schedule.saturdayGraceMinutes,
        }
      : {
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          graceMinutes: schedule.graceMinutes,
        };

  const { startDateTime } = convertScheduleToDate(selectedSchedule, now);

  // Normalize to minutes (no seconds/milliseconds)
  const startTime = new Date(startDateTime);
  startTime.setSeconds(0, 0);

  const graceTime = new Date(startTime);
  graceTime.setMinutes(graceTime.getMinutes() + selectedSchedule.graceMinutes);
  graceTime.setSeconds(0, 0);

  const normalizedNow = new Date(now);
  normalizedNow.setSeconds(0, 0);

  return normalizedNow <= graceTime ? "PRESENT" : "LATE";
}
