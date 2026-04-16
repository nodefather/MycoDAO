"use client";

import type { PodcastStreamdeckButton } from "@/lib/podcast-live-config";

type PodcastStreamDeckProps = {
  buttons: PodcastStreamdeckButton[];
  activeId: string | null;
  onSelect: (btn: PodcastStreamdeckButton) => void;
  className?: string;
};

/**
 * OBS-style scene buttons: each switches the live iframe `src` to `embedUrl`.
 */
export default function PodcastStreamDeck({
  buttons,
  activeId,
  onSelect,
  className = "",
}: PodcastStreamDeckProps) {
  if (buttons.length === 0) {
    return (
      <div
        className={`rounded border border-dashed border-stone-700 bg-stone-950/60 p-3 text-xs text-stone-500 ${className}`}
      >
        No stream deck scenes. Set{" "}
        <code className="text-stone-400">NEXT_PUBLIC_PULSE_STREAMDECK_JSON</code> with a JSON array of{" "}
        <code className="text-stone-400">label</code> + <code className="text-stone-400">embedUrl</code> (https
        embeds only).
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 font-mono">
          Stream deck
        </span>
        <span className="text-[10px] text-stone-600 font-mono">{buttons.length} scenes</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {buttons.map((b) => {
          const on = activeId === b.id;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => onSelect(b)}
              className={`min-h-[44px] min-w-[100px] px-3 py-2 rounded border text-left transition-colors font-mono text-xs ${
                on
                  ? "border-emerald-600 bg-emerald-950/50 text-emerald-200"
                  : "border-stone-700 bg-stone-900 text-stone-300 hover:border-stone-500 hover:bg-stone-800"
              }`}
            >
              {b.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
