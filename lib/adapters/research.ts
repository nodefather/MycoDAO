/**
 * Research items: MINDEX /api/mindex/research (internal token) or OpenAlex direct.
 */

import type { ResearchItem } from "@/lib/types";
import { mindexApiBase, mindexInternalHeaders } from "@/lib/server/pulse-env";

const OPENALEX_BASE = "https://api.openalex.org";
const OPENALEX_HEADERS = {
  "User-Agent": "MycoDAO-Pulse/1.0 (https://mycodao.financial; contact@mycosoft.com)",
};

const DEFAULT_QUERY = "fungi mycology DAO";

function mapPaperToResearchItem(
  paper: {
    id: string;
    title: string;
    abstract?: string | null;
    publication_date?: string | null;
    journal?: string | null;
    url?: string | null;
    open_access_url?: string | null;
  },
  i: number
): ResearchItem {
  const summary = (paper.abstract || "").slice(0, 280) || paper.title;
  const pub = paper.publication_date || new Date().toISOString();
  const cat: ResearchItem["category"] =
    /grant|fund|treasury/i.test(paper.title) ? "funding" : /biobank|sample|lab/i.test(paper.title) ? "biobank" : "science";
  return {
    id: paper.id || `oa-${i}`,
    title: paper.title,
    source: paper.journal || "OpenAlex",
    summary,
    category: cat,
    publishedAt: pub,
  };
}

async function fetchFromMindex(search: string, limit: number): Promise<ResearchItem[] | null> {
  const base = mindexApiBase();
  const headers = mindexInternalHeaders();
  if (!base || !headers["X-Internal-Token"]) return null;
  const url = `${base}/api/mindex/research?search=${encodeURIComponent(search)}&limit=${limit}`;
  const res = await fetch(url, { headers, cache: "no-store", signal: AbortSignal.timeout(12_000) });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    papers?: Array<{
      id: string;
      title: string;
      abstract?: string;
      publication_date?: string;
      journal?: string;
      url?: string;
      open_access_url?: string;
    }>;
  };
  const papers = data.papers || [];
  return papers.map((p, i) =>
    mapPaperToResearchItem(
      {
        id: p.id,
        title: p.title,
        abstract: p.abstract,
        publication_date: p.publication_date,
        journal: p.journal,
        url: p.url || p.open_access_url,
        open_access_url: p.open_access_url,
      },
      i
    )
  );
}

async function fetchFromOpenAlex(search: string, limit: number): Promise<ResearchItem[]> {
  const q = `${search} fungi OR mycology OR fungal`.trim();
  const url = `${OPENALEX_BASE}/works?search=${encodeURIComponent(q)}&per_page=${limit}`;
  const res = await fetch(url, { headers: OPENALEX_HEADERS, cache: "no-store", signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`OpenAlex ${res.status}`);
  const data = (await res.json()) as { results?: Array<Record<string, unknown>> };
  const results = data.results || [];
  const out: ResearchItem[] = [];
  let i = 0;
  for (const work of results) {
    const id = String((work as { id?: string }).id || "").replace("https://openalex.org/", "") || `oa-${i}`;
    const title = String((work as { title?: string }).title || "Untitled");
    const pub = (work as { publication_date?: string }).publication_date || new Date().toISOString();
    const journal = (work as { primary_location?: { source?: { display_name?: string } } }).primary_location?.source
      ?.display_name;
    const paper = {
      id,
      title,
      abstract: undefined as string | undefined,
      publication_date: pub,
      journal,
      url: (work as { doi?: string }).doi || id,
      open_access_url: undefined as string | undefined,
    };
    out.push(mapPaperToResearchItem(paper, i));
    i++;
    if (out.length >= limit) break;
  }
  return out;
}

export async function fetchResearchItems(): Promise<ResearchItem[]> {
  const search = process.env.RESEARCH_QUERY?.trim() || DEFAULT_QUERY;
  const limit = Math.min(25, Math.max(5, parseInt(process.env.RESEARCH_LIMIT || "12", 10) || 12));

  const fromMindex = await fetchFromMindex(search, limit);
  if (fromMindex && fromMindex.length > 0) return fromMindex;

  try {
    const fromOx = await fetchFromOpenAlex(search, limit);
    if (fromOx.length > 0) return fromOx;
  } catch {
    /* fall through */
  }

  return [];
}
