/**
 * Podcast episodes: RSS feeds (PODCAST_RSS_URLS comma-separated) or mock when ALLOW_MOCK_FALLBACK.
 */

import type { PodcastEpisode } from "@/lib/types";
import { allowMockFallback } from "@/lib/server/pulse-env";
import { getMockPodcasts } from "@/lib/mock-data";
import Parser from "rss-parser";

const parser = new Parser();

export async function fetchPodcastEpisodes(): Promise<PodcastEpisode[]> {
  const raw = process.env.PODCAST_RSS_URLS?.trim();
  if (!raw) {
    if (allowMockFallback()) return getMockPodcasts();
    return [];
  }

  const urls = raw
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean);
  const out: PodcastEpisode[] = [];
  let idx = 0;
  for (const feedUrl of urls.slice(0, 5)) {
    try {
      const feed = await parser.parseURL(feedUrl);
      const show = feed.title || "Podcast";
      for (const item of feed.items.slice(0, 8)) {
        const audioUrl =
          item.enclosure?.url ||
          (item as { link?: string }).link ||
          "#";
        const pub = item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString();
        const itunes = (item as { itunes?: { image?: string; duration?: string } }).itunes;
        out.push({
          id: `rss-${idx++}`,
          title: (item.title || "Episode").slice(0, 200),
          show,
          description: (item.contentSnippet || item.summary || "").slice(0, 400),
          audioUrl,
          image: itunes?.image,
          durationSec: itunes?.duration ? parseItunesDuration(String(itunes.duration)) : 1800,
          publishedAt: pub,
        });
      }
    } catch {
      /* next feed */
    }
  }

  if (out.length > 0) return out.slice(0, 24);
  if (allowMockFallback()) return getMockPodcasts();
  return [];
}

function parseItunesDuration(s: string): number {
  const parts = s.split(":").map((p) => parseInt(p, 10));
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : 1800;
}
