export const formatIndianTime = (isoString?: string) => {
  // here date format this current 2025:01:01T00:00:00.000Z
  // so we need to convert this to indian time like extrect hours and minutr 13:10but i need 12 hours

  if (!isoString) {
    return "N/A";
  }

  const date = new Date(isoString);

  const hours = date.getUTCHours();

  const minutes = date.getUTCMinutes();

  const ampm = hours >= 12 ? "PM" : "AM";
  const twelveHourFormat = hours % 12 || 12;

  return `${twelveHourFormat}:${minutes < 10 ? "0" : ""}${minutes} ${ampm}`;
};

export const formatTimeTo12Hour = (time: string) => {
  const [hour, minute] = time.split(":").map(Number);
  const period = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 || 12; // Convert 0 to 12 for midnight
  const formattedMinute = minute.toString().padStart(2, "0");
  return `${formattedHour}:${formattedMinute} ${period}`;
};

export const getDate = () => {
  const date = new Date();
  //need format like date-month-year
  return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
};
