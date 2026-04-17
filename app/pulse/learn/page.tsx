"use client";

import { useMemo, useState } from "react";
import LessonCard from "@/components/pulse/LessonCard";
import { usePulse } from "@/lib/pulse-provider";
import Link from "next/link";
import type { LearnTrack } from "@/lib/types";
import { LEARN_TRACK_LABELS, LEARN_TRACK_ORDER } from "@/lib/learn-tracks";

export default function LearnPage() {
  const { learn } = usePulse();
  const [track, setTrack] = useState<LearnTrack | "all">("all");

  const filtered = useMemo(() => {
    if (track === "all") return learn;
    return learn.filter((m) => (m.track ?? "markets-basics") === track);
  }, [learn, track]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-stone-100">Learn</h1>
          <p className="text-sm text-stone-400 mt-1">
            Markets, mycology, bio IP, token standards, DeSci, and funding — curated primers with external references.
          </p>
          <p className="text-xs text-stone-500 mt-2">
            Filters narrow by track; lesson cards link to full markdown and tools.
          </p>
        </div>
        <Link href="/pulse" className="text-xs text-stone-500 hover:text-stone-300 shrink-0 min-h-[44px] inline-flex items-center">
          ← Pulse
        </Link>
      </header>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          type="button"
          onClick={() => setTrack("all")}
          className={`rounded-full px-3 py-2 text-xs min-h-[44px] border transition-colors ${
            track === "all"
              ? "border-amber-500/60 bg-amber-950/40 text-stone-100"
              : "border-stone-700 bg-stone-900 text-stone-400 hover:border-stone-600"
          }`}
        >
          All tracks
        </button>
        {LEARN_TRACK_ORDER.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTrack(t)}
            className={`rounded-full px-3 py-2 text-xs min-h-[44px] border transition-colors ${
              track === t
                ? "border-amber-500/60 bg-amber-950/40 text-stone-100"
                : "border-stone-700 bg-stone-900 text-stone-400 hover:border-stone-600"
            }`}
          >
            {LEARN_TRACK_LABELS[t]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((m) => (
          <LessonCard key={m.id} module={m} />
        ))}
      </div>
      {learn.length === 0 && (
        <p className="text-stone-500 text-sm mt-6">
          No lessons loaded. Add <code className="text-stone-400">data/learn-modules.json</code> or set{" "}
          <code className="text-stone-400">LEARN_MODULES_URL</code>. For local empty-state testing,{" "}
          <code className="text-stone-400">LEARN_DEV_FALLBACK=1</code>.
        </p>
      )}
      {learn.length > 0 && filtered.length === 0 && (
        <p className="text-stone-500 text-sm mt-6">No lessons in this track — pick another filter.</p>
      )}
    </div>
  );
}
