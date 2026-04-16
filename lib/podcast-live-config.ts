"use client";

/** Stream deck button: switches the live iframe to `embedUrl`. */
export interface PodcastStreamdeckButton {
  id: string;
  label: string;
  embedUrl: string;
}

export function podcastLiveEmbedDefault(): string | null {
  const u = process.env.NEXT_PUBLIC_PULSE_PODCAST_LIVE_EMBED_URL?.trim();
  return u || null;
}

export function podcastLiveStreamLabel(): string | null {
  const u = process.env.NEXT_PUBLIC_PULSE_PODCAST_LIVE_LABEL?.trim();
  return u || null;
}

/**
 * JSON array: `[{"id":"a","label":"Program","embedUrl":"https://www.youtube.com/embed/..."}]`
 * Only https embed URLs accepted.
 */
export function parsePodcastStreamdeck(): PodcastStreamdeckButton[] {
  const raw = process.env.NEXT_PUBLIC_PULSE_STREAMDECK_JSON?.trim();
  if (!raw) return [];
  try {
    const j = JSON.parse(raw) as unknown;
    if (!Array.isArray(j)) return [];
    const out: PodcastStreamdeckButton[] = [];
    j.forEach((x, i) => {
      if (!x || typeof x !== "object") return;
      const o = x as Record<string, unknown>;
      const embedUrl = String(o.embedUrl ?? "").trim();
      if (!embedUrl.startsWith("https://")) return;
      out.push({
        id: String(o.id ?? `sd-${i}`),
        label: String(o.label ?? `Scene ${i + 1}`).slice(0, 36),
        embedUrl,
      });
    });
    return out;
  } catch {
    return [];
  }
}
