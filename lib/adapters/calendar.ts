/**
 * Upcoming macro/DAO catalysts: Finnhub economic calendar or optional JSON URL.
 */

import type { UpcomingCatalyst } from "@/lib/upcoming-catalysts";

function mapImpact(impact?: string): UpcomingCatalyst["importance"] {
  if (impact === "high") return "high";
  if (impact === "medium") return "medium";
  return "low";
}

function formatFinnhubRow(r: {
  time?: string;
  event?: string;
  impact?: string;
  country?: string;
}): UpcomingCatalyst {
  const rawTime = r.time || "";
  const d = rawTime ? new Date(rawTime.replace(" ", "T") + "Z") : new Date(NaN);
  const date =
    Number.isFinite(d.getTime())
      ? d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : rawTime.slice(5, 10) || "—";
  const time =
    Number.isFinite(d.getTime())
      ? d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZoneName: "short" })
      : "TBD";
  return {
    date,
    label: (r.event || "Economic event").slice(0, 120),
    time,
    importance: mapImpact(r.impact),
    relatedSymbols: r.country === "US" ? ["SPY", "DXY"] : [],
    catalystType: "macro",
  };
}

export async function fetchUpcomingCatalysts(): Promise<UpcomingCatalyst[]> {
  const jsonUrl = process.env.CALENDAR_JSON_URL?.trim();
  if (jsonUrl) {
    try {
      const res = await fetch(jsonUrl, { cache: "no-store", signal: AbortSignal.timeout(12_000) });
      if (res.ok) {
        const data = (await res.json()) as UpcomingCatalyst[];
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch {
      /* fall through */
    }
  }

  const key = process.env.FINNHUB_API_KEY?.trim();
  if (key) {
    try {
      const from = new Date();
      const to = new Date();
      to.setDate(to.getDate() + 14);
      const fromStr = from.toISOString().slice(0, 10);
      const toStr = to.toISOString().slice(0, 10);
      const url = `https://finnhub.io/api/v1/calendar/economic?from=${fromStr}&to=${toStr}&token=${key}`;
      const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(15_000) });
      if (res.ok) {
        const data = (await res.json()) as {
          economicCalendar?: Array<{ time?: string; event?: string; impact?: string; country?: string }>;
        };
        const rows = data.economicCalendar || [];
        const mapped = rows.slice(0, 24).map(formatFinnhubRow);
        if (mapped.length > 0) return mapped;
      }
    } catch {
      /* fall through */
    }
  }

  return [];
}
