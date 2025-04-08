interface Attendance {
  checkIn?: Date | string | null;
  checkOut?: Date | string | null;
}

export const calculateWorkHours = (attendance: Attendance) => {
  if (!attendance.checkIn || !attendance.checkOut) return "00:00";

  const checkIn = new Date(attendance.checkIn);
  const checkOut = new Date(attendance.checkOut);

  // Calculate difference in milliseconds
  const diffMs = checkOut.valueOf() - checkIn.valueOf();

  // Convert to minutes, rounding to nearest minute
  const minutes = Math.round(diffMs / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours.toString().padStart(2, "0")}:${remainingMinutes
    .toString()
    .padStart(2, "0")}`;
};

export const calculateMonthlyWorkHours = (attendanceList: Attendance[]) => {
  let totalMinutes = 0;

  for (const attendance of attendanceList) {
    if (attendance.checkIn && attendance.checkOut) {
      const checkIn = new Date(attendance.checkIn);
      const checkOut = new Date(attendance.checkOut);

      const diffMs = checkOut.valueOf() - checkIn.valueOf();
      const minutes = Math.round(diffMs / (1000 * 60));
      totalMinutes += minutes;
    }
  }

  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  return `${hours.toString().padStart(2, "0")}:${remainingMinutes
    .toString()
    .padStart(2, "0")}`;
};
