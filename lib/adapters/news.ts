/**
 * News: GNews or NewsAPI when keys are set; empty array or mock per ALLOW_MOCK_FALLBACK.
 */

import type { NewsItem } from "@/lib/types";
import { getMockNews } from "@/lib/mock-data";
import { allowMockFallback } from "@/lib/server/pulse-env";

const CACHE_TTL_MS = 5 * 60_000;
let cached: NewsItem[] | null = null;
let cachedAt = 0;

export async function fetchNews(): Promise<NewsItem[]> {
  if (cached && Date.now() - cachedAt < CACHE_TTL_MS) return cached;

  const gnews = process.env.GNEWS_API_KEY?.trim();
  const newsapi = process.env.NEWS_API_KEY?.trim();

  if (!gnews && !newsapi) {
    if (allowMockFallback()) {
      const mock = getMockNews();
      cached = mock;
      cachedAt = Date.now();
      return mock;
    }
    cached = null;
    return [];
  }

  try {
    const url = gnews
      ? `https://gnews.io/api/v4/top-headlines?token=${gnews}&lang=en&max=15`
      : `https://newsapi.org/v2/top-headlines?country=us&apiKey=${newsapi}&pageSize=15`;
    const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(12_000) });
    if (!res.ok) {
      if (allowMockFallback()) return getMockNews();
      cached = null;
      return [];
    }
    const json = await res.json();
    const articles = json.articles || json.results || [];
    const mapped: NewsItem[] = (articles.slice(0, 12) as Array<{
      title?: string;
      description?: string;
      url?: string;
      source?: { name?: string };
      publishedAt?: string;
    }>).map((a, i) => ({
      id: `ext-${i}`,
      source: a.source?.name || "News",
      title: a.title || "",
      summary: a.description || "",
      url: a.url || "#",
      tags: [],
      publishedAt: a.publishedAt || new Date().toISOString(),
      category: "markets" as const,
    }));
    if (mapped.length === 0) {
      if (allowMockFallback()) return getMockNews();
      return [];
    }
    cached = mapped;
    cachedAt = Date.now();
    return mapped;
  } catch {
    cached = null;
    if (allowMockFallback()) return getMockNews();
    return [];
  }
}
