import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Creates a date at 00:00:00 in UTC for a given date string
 * This ensures consistent date handling for the database
 */
export function createUTCDateOnly(dateString: string | Date): Date {
  const date = new Date(dateString);
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      0,
      0,
      0,
      0
    )
  );
}

/**
 * Generate an array of dates between start and end (inclusive)
 */
export function generateDateRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);

  // Ensure we're working with UTC dates at 00:00:00
  const start = createUTCDateOnly(startDate);
  const end = createUTCDateOnly(endDate);

  // Set current to start
  currentDate.setTime(start.getTime());

  // Generate dates until we reach the end date
  while (currentDate <= end) {
    //skip date sunday
    if (currentDate.getDay() !== 0) {
      dates.push(new Date(currentDate));
    }
    // Move to the next day
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  return dates;
}
