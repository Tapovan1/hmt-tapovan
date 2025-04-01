export function formatTimeWindow(schedule: {
  startTime: string;
  endTime: string;
  graceMinutes: number;
}) {
  const [hours, minutes] = schedule.startTime.split(":").map(Number);
  const startTime = new Date();
  startTime.setHours(hours, minutes, 0);

  const [ehours, eminutes] = schedule.endTime.split(":").map(Number);
  const endTime = new Date();
  endTime.setHours(ehours, eminutes, 0);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
}
