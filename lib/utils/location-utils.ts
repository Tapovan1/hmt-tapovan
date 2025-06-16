/**
 * Converts degrees to radians
 */
export function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculates the distance between two geographic coordinates using the Haversine formula
 * @returns Distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters (was 6371 km)
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distance in meters
}

/**
 * Checks if user location is within a given radius of the target
 * @param radiusMeters Radius in meters
 */
export function isWithinRadius(
  userLat: number,
  userLon: number,
  targetLat: number,
  targetLon: number,
  radiusMeters: number
): boolean {
  const distance = calculateDistance(userLat, userLon, targetLat, targetLon);
  // return true;
  return distance <= radiusMeters;
}

/**
 * Formats coordinates nicely
 */
export function formatCoordinates(
  latitude: number | null,
  longitude: number | null,
  decimals = 6
): string {
  if (latitude === null || longitude === null) {
    return "Unknown location";
  }
  return `${latitude.toFixed(decimals)}, ${longitude.toFixed(decimals)}`;
}
