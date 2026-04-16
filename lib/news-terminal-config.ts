/**
 * Client-safe config for Pulse News terminal (NEXT_PUBLIC_* only).
 */

const DEFAULT_TAPE = [
  "BTC",
  "ETH",
  "SOL",
  "SPY",
  "QQQ",
  "DXY",
  "GOLD",
  "OIL",
  "VIX",
  "MYCO",
  "NVDA",
  "AAPL",
] as const;

export function newsTapeSymbolsFromEnv(): string[] {
  const raw = process.env.NEXT_PUBLIC_PULSE_NEWS_TAPE_SYMBOLS?.trim();
  if (!raw) return [...DEFAULT_TAPE];
  return raw
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
}

export function newsVideoEmbedUrl(): string | null {
  const u = process.env.NEXT_PUBLIC_PULSE_NEWS_VIDEO_EMBED_URL?.trim();
  return u || null;
}

export function newsStreamLabel(): string | null {
  const u = process.env.NEXT_PUBLIC_PULSE_NEWS_STREAM_LABEL?.trim();
  return u || null;
}

export function newsAdImageUrl(): string | null {
  const u = process.env.NEXT_PUBLIC_PULSE_NEWS_AD_IMAGE_URL?.trim();
  return u || null;
}

export function newsAdClickUrl(): string | null {
  const u = process.env.NEXT_PUBLIC_PULSE_NEWS_AD_CLICK_URL?.trim();
  return u || null;
}

export function newsAdTitle(): string | null {
  const u = process.env.NEXT_PUBLIC_PULSE_NEWS_AD_TITLE?.trim();
  return u || null;
}

export function newsAdSecondaryImageUrl(): string | null {
  const u = process.env.NEXT_PUBLIC_PULSE_NEWS_AD_SECONDARY_IMAGE_URL?.trim();
  return u || null;
}
