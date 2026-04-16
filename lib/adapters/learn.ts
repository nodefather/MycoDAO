/**
 * Learn modules: LEARN_MODULES_URL JSON or local `data/learn-modules.json` (real curriculum files only).
 */

import { readFile } from "fs/promises";
import path from "path";
import type { LearnModule } from "@/lib/types";

function isLearnArray(x: unknown): x is LearnModule[] {
  return Array.isArray(x) && x.every((m) => m && typeof (m as LearnModule).id === "string");
}

export async function fetchLearnModules(): Promise<LearnModule[]> {
  const remote = process.env.LEARN_MODULES_URL?.trim();
  if (remote) {
    try {
      const res = await fetch(remote, { cache: "no-store", signal: AbortSignal.timeout(12_000) });
      if (res.ok) {
        const data = await res.json();
        if (isLearnArray(data)) return data;
      }
    } catch {
      /* fall through */
    }
  }

  try {
    const localPath = path.join(process.cwd(), "data", "learn-modules.json");
    const raw = await readFile(localPath, "utf8");
    const data = JSON.parse(raw) as unknown;
    if (isLearnArray(data) && data.length > 0) return data;
  } catch {
    /* missing file */
  }

  return [];
}
