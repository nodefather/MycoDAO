/**
 * Server-only env helpers for Pulse API routes and adapters.
 */

export function allowMockFallback(): boolean {
  return process.env.ALLOW_MOCK_FALLBACK === "true" || process.env.ALLOW_MOCK_FALLBACK === "1";
}

export function masApiBase(): string {
  return (process.env.MAS_API_URL || "").replace(/\/$/, "");
}

export function mindexApiBase(): string {
  return (process.env.MINDEX_API_URL || "").replace(/\/$/, "");
}

export function natureOsApiBase(): string {
  return (process.env.NATUREOS_API_URL || "").replace(/\/$/, "");
}

/** Headers for MINDEX internal zone when MINDEX_INTERNAL_TOKEN is set. */
export function mindexInternalHeaders(): Record<string, string> {
  const t = process.env.MINDEX_INTERNAL_TOKEN?.trim();
  if (!t) return {};
  return { "X-Internal-Token": t };
}

/** Aggressive refresh defaults for private fiber / colocated ingest (still bounded by upstream APIs). */
export function pulseTradeFastPath(): boolean {
  return process.env.PULSE_TRADE_FAST_PATH === "true" || process.env.PULSE_TRADE_FAST_PATH === "1";
}

/**
 * Server-side ticker merge cache. On LAN, use low values (e.g. 100–400) or 0 to always merge fresh.
 * When `PULSE_TRADE_FAST_PATH=1` and unset, defaults to 400ms (not 60s).
 */
export function tickerCacheTtlMs(): number {
  const raw = process.env.PULSE_TICKER_CACHE_MS?.trim();
  if (raw === "0") return 0;
  if (raw != null && raw !== "") {
    const n = parseInt(raw, 10);
    if (!Number.isNaN(n)) return Math.max(0, n);
  }
  return pulseTradeFastPath() ? 400 : 60_000;
}

/** How often `/api/pulse/stream` pushes a ticker snapshot (ms). Min 50. */
export function pulseSseIntervalMs(): number {
  const raw = process.env.PULSE_SSE_INTERVAL_MS?.trim();
  const n = raw != null && raw !== "" ? parseInt(raw, 10) : NaN;
  const v = Number.isNaN(n) ? (pulseTradeFastPath() ? 150 : 2000) : n;
  return Math.max(50, v);
}

/** If true, each SSE tick bypasses the merge cache (forces upstream fetches when TTL would otherwise hit). */
export function pulseStreamBypassCache(): boolean {
  return process.env.PULSE_STREAM_BYPASS_CACHE === "true" || process.env.PULSE_STREAM_BYPASS_CACHE === "1";
}
