/**
 * Learn modules: LEARN_MODULES_URL JSON or local `data/learn-modules.json` (real curriculum files only).
 * Optional dev fallback when `LEARN_DEV_FALLBACK=1` and no remote/local data (see `learn-dev-fallback.ts`).
 */

import { readFile } from "fs/promises";
import path from "path";
import type { LearnModule, LearnResourceLink, LearnTrack } from "@/lib/types";
import { getMockLearnModules } from "@/lib/adapters/learn-dev-fallback";

const TRACKS: ReadonlySet<string> = new Set<LearnTrack>([
  "markets-basics",
  "fungi-mycology",
  "bio-ip",
  "nfts-ordinals",
  "desci",
  "funding-grants",
  "governance",
]);

function isResourceLink(x: unknown): x is LearnResourceLink {
  if (!x || typeof x !== "object") return false;
  const o = x as { label?: unknown; href?: unknown };
  return typeof o.label === "string" && typeof o.href === "string" && o.label.length > 0 && o.href.length > 0;
}

function isLearnModule(x: unknown): x is LearnModule {
  if (!x || typeof x !== "object") return false;
  const m = x as Record<string, unknown>;
  if (typeof m.id !== "string" || m.id.length === 0) return false;
  if (typeof m.title !== "string" || m.title.length === 0) return false;
  if (m.level !== "beginner" && m.level !== "intermediate" && m.level !== "advanced") return false;
  if (typeof m.readingTimeMin !== "number" || m.readingTimeMin < 0) return false;
  if (typeof m.summary !== "string") return false;
  if (!Array.isArray(m.tags) || !m.tags.every((t) => typeof t === "string")) return false;
  if (typeof m.contentMd !== "string") return false;
  if (m.track !== undefined) {
    if (typeof m.track !== "string" || !TRACKS.has(m.track)) return false;
  }
  if (m.resourceLinks !== undefined) {
    if (!Array.isArray(m.resourceLinks) || !m.resourceLinks.every(isResourceLink)) return false;
  }
  return true;
}

function isLearnArray(x: unknown): x is LearnModule[] {
  return Array.isArray(x) && x.length > 0 && x.every(isLearnModule);
}

const DEFAULT_TRACK: LearnTrack = "markets-basics";

function normalizeModule(m: LearnModule): LearnModule {
  return {
    ...m,
    track: m.track ?? DEFAULT_TRACK,
  };
}

export async function fetchLearnModules(): Promise<LearnModule[]> {
  const remote = process.env.LEARN_MODULES_URL?.trim();
  if (remote) {
    try {
      const res = await fetch(remote, { cache: "no-store", signal: AbortSignal.timeout(12_000) });
      if (res.ok) {
        const data = await res.json();
        if (isLearnArray(data)) return data.map(normalizeModule);
      }
    } catch {
      /* fall through */
    }
  }

  try {
    const localPath = path.join(process.cwd(), "data", "learn-modules.json");
    const raw = await readFile(localPath, "utf8");
    const data = JSON.parse(raw) as unknown;
    if (isLearnArray(data)) return data.map(normalizeModule);
  } catch {
    /* missing file */
  }

  if (process.env.LEARN_DEV_FALLBACK === "1" || process.env.LEARN_DEV_FALLBACK === "true") {
    return getMockLearnModules();
  }

  return [];
}
