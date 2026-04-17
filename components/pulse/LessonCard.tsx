"use client";

import Link from "next/link";
import type { LearnModule } from "@/lib/types";
import { LEARN_TRACK_LABELS } from "@/lib/learn-tracks";

type LessonCardProps = {
  module: LearnModule;
};

export default function LessonCard({ module: m }: LessonCardProps) {
  const track = m.track ?? "markets-basics";
  const trackLabel = LEARN_TRACK_LABELS[track] ?? track;

  return (
    <Link
      href={`/pulse/learn/${m.id}`}
      className="block rounded border border-stone-700 bg-stone-900/80 p-4 hover:border-stone-600 transition-colors"
    >
      <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 mb-2">
        <span className="rounded bg-stone-800 px-2 py-0.5 text-amber-400/90 border border-stone-600">{trackLabel}</span>
        <span className="capitalize">{m.level}</span>
        <span>·</span>
        <span>{m.readingTimeMin} min</span>
      </div>
      <h3 className="text-sm font-semibold text-stone-200">{m.title}</h3>
      <p className="text-xs text-stone-400 mt-1 line-clamp-2">{m.summary}</p>
      {m.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {m.tags.slice(0, 4).map((t) => (
            <span key={t} className="text-[10px] uppercase tracking-wide text-stone-500 bg-stone-950/80 px-1.5 py-0.5 rounded">
              {t}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
