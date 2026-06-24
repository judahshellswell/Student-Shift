// Distance utilities for UK postcode-based location matching.
// Pure math only — kept in sync with src/lib/geocoding.ts on mobile.

export const DEFAULT_SEARCH_RADIUS_KM = 10;
export const MIN_SEARCH_RADIUS_KM = 1;
export const MAX_SEARCH_RADIUS_KM = 50;
export const RADIUS_OPTIONS = [5, 10, 15, 25, 50];

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate the great-circle distance between two lat/lng points in km.
 */
export function calculateDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

/**
 * Null-safe distance calculation. Returns null if any coordinate is missing.
 */
export function getJobDistanceKm(
  studentLat: number | null | undefined,
  studentLng: number | null | undefined,
  jobLat: number | null | undefined,
  jobLng: number | null | undefined
): number | null {
  if (
    studentLat == null ||
    studentLng == null ||
    jobLat == null ||
    jobLng == null
  ) {
    return null;
  }
  return calculateDistanceKm(studentLat, studentLng, jobLat, jobLng);
}

/**
 * Convert distance to a match score (0-40 points).
 * Closer jobs get higher scores. Beyond the radius, score is 0.
 */
export function distanceToScore(distanceKm: number, radiusKm: number): number {
  if (distanceKm > radiusKm) return 0;
  return Math.round(40 * (1 - distanceKm / radiusKm));
}
