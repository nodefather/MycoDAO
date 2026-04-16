"use client";

import { useCallback, useMemo, useState } from "react";
import {
  parsePodcastStreamdeck,
  podcastLiveEmbedDefault,
  podcastLiveStreamLabel,
  type PodcastStreamdeckButton,
} from "@/lib/podcast-live-config";
import PodcastStreamDeck from "@/components/pulse/PodcastStreamDeck";

export default function PodcastLiveStudio() {
  const defaultEmbed = podcastLiveEmbedDefault();
  const label = podcastLiveStreamLabel();
  const deck = useMemo(() => parsePodcastStreamdeck(), []);

  const firstSrc = useMemo(() => defaultEmbed || deck[0]?.embedUrl || null, [defaultEmbed, deck]);
  const firstActiveId = useMemo(() => {
    if (!firstSrc) return deck[0]?.id ?? null;
    return deck.find((b) => b.embedUrl === firstSrc)?.id ?? deck[0]?.id ?? null;
  }, [deck, firstSrc]);

  const [embedSrc, setEmbedSrc] = useState<string | null>(firstSrc);
  const [activeId, setActiveId] = useState<string | null>(firstActiveId);

  const onSelect = useCallback((btn: PodcastStreamdeckButton) => {
    setEmbedSrc(btn.embedUrl);
    setActiveId(btn.id);
  }, []);

  return (
    <section className="rounded border border-stone-800 bg-stone-950/80 overflow-hidden" aria-label="Live studio">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-stone-800 bg-stone-900/90">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex items-center gap-1.5 shrink-0" aria-hidden>
            <span className="h-2 w-2 rounded-full bg-red-500 motion-reduce:animate-none animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 font-mono">Live</span>
          </span>
          {label && (
            <span className="text-[11px] font-mono text-stone-400 truncate" title={label}>
              {label}
            </span>
          )}
        </div>
      </div>

      <div className="relative w-full aspect-video bg-black">
        {embedSrc ? (
          <iframe
            title="Live podcast stream"
            src={embedSrc}
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center p-6">
            <p className="text-sm text-stone-400 font-medium">No live embed configured</p>
            <p className="text-xs text-stone-600 max-w-lg">
              Set <code className="text-stone-500">NEXT_PUBLIC_PULSE_PODCAST_LIVE_EMBED_URL</code> and/or add
              scenes in <code className="text-stone-500">NEXT_PUBLIC_PULSE_STREAMDECK_JSON</code>, then rebuild.
            </p>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-stone-800">
        <PodcastStreamDeck buttons={deck} activeId={activeId} onSelect={onSelect} />
      </div>
    </section>
  );
}
