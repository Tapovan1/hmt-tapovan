export const formatIndianTime = (isoString?: string) => {
  // here date format this current 2025:01:01T00:00:00.000Z
  // so we need to convert this to indian time like extrect hours and minutr 13:10but i need 12 hours

  if (!isoString) {
    return "N/A";
  }

  console.log("dateISO", isoString);

  const date = new Date(isoString);
  console.log("date", date);

  const hours = date.getUTCHours();

  const minutes = date.getUTCMinutes();
  console.log("minutes", minutes);
  const ampm = hours >= 12 ? "PM" : "AM";
  const twelveHourFormat = hours % 12 || 12;
  console.log("twelveHourFormat", twelveHourFormat);

  return `${twelveHourFormat}:${minutes < 10 ? "0" : ""}${minutes} ${ampm}`;
};

export const formatTimeTo12Hour = (time: string) => {
  const [hour, minute] = time.split(":").map(Number);
  const period = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 || 12; // Convert 0 to 12 for midnight
  const formattedMinute = minute.toString().padStart(2, "0");
  return `${formattedHour}:${formattedMinute} ${period}`;
};
