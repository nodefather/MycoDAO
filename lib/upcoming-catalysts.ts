/**
 * Upcoming catalysts from `/api/calendar` (Finnhub or CALENDAR_JSON_URL).
 * Legacy sync helpers return empty arrays — use PulseProvider live data.
 */

export type CatalystImportance = "high" | "medium" | "low";

export type UpcomingCatalyst = {
  date: string;
  label: string;
  time: string;
  importance: CatalystImportance;
  relatedSymbols?: string[];
  catalystType?: string;
};

/** @deprecated No static fallback; use `upcomingCatalysts` from PulseProvider. */
export function getUpcomingCatalysts(): UpcomingCatalyst[] {
  return [];
}
