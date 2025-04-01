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
  schedule: { startTime: string; endTime: string; graceMinutes: number }
) {
  const { startDateTime } = convertScheduleToDate(schedule, now);

  const startTime = new Date(startDateTime);

  const graceTime = new Date(startTime);
  graceTime.setMinutes(graceTime.getMinutes() + schedule.graceMinutes);

  if (now <= graceTime) {
    return "PRESENT";
  } else {
    return "LATE";
  }
}
