"use client";

import { useMemo } from "react";
import Link from "next/link";
import PodcastChatPanel from "@/components/pulse/PodcastChatPanel";
import PodcastLiveStudio from "@/components/pulse/PodcastLiveStudio";
import PodcastPlayer from "@/components/pulse/PodcastPlayer";
import { isAudioLibraryEpisode, isVodEpisode } from "@/lib/podcast-episode-utils";
import { usePulse } from "@/lib/pulse-provider";

export default function PodcastsPage() {
  const { podcasts } = usePulse();

  const vodEpisodes = useMemo(() => podcasts.filter(isVodEpisode), [podcasts]);
  const audioEpisodes = useMemo(() => podcasts.filter(isAudioLibraryEpisode), [podcasts]);

  return (
    <div className="max-w-[1680px] mx-auto px-3 sm:px-4 py-6 pb-28 space-y-10 min-h-0">
      <header className="flex items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-stone-100 font-mono tracking-tight">
            Podcast studio
          </h1>
          <p className="text-[11px] text-stone-500 mt-1">
            Live stream · stream deck · chat · VOD · audio library (RSS via{" "}
            <code className="text-stone-600">PODCAST_RSS_URLS</code>)
          </p>
        </div>
        <Link href="/pulse" className="text-xs text-stone-500 hover:text-stone-300 shrink-0 font-mono">
          ← Pulse
        </Link>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_min(100%,380px)] gap-4 items-start">
        <PodcastLiveStudio />
        <PodcastChatPanel />
      </div>

      <section aria-labelledby="vod-heading">
        <h2
          id="vod-heading"
          className="text-sm font-bold uppercase tracking-widest text-stone-500 font-mono mb-3"
        >
          VOD / video library
        </h2>
        {vodEpisodes.length === 0 ? (
          <p className="text-sm text-stone-500 rounded border border-stone-800 bg-stone-950/50 p-4">
            No video episodes yet. Add RSS feeds with YouTube links or video enclosures in{" "}
            <code className="text-stone-600">PODCAST_RSS_URLS</code>.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vodEpisodes.map((ep) => (
              <PodcastPlayer key={ep.id} episode={ep} />
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="audio-heading">
        <h2
          id="audio-heading"
          className="text-sm font-bold uppercase tracking-widest text-stone-500 font-mono mb-3"
        >
          Audio library
        </h2>
        {audioEpisodes.length === 0 ? (
          <p className="text-sm text-stone-500 rounded border border-stone-800 bg-stone-950/50 p-4">
            No audio episodes yet. Point <code className="text-stone-600">PODCAST_RSS_URLS</code> at audio RSS
            feeds.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {audioEpisodes.map((ep) => (
              <PodcastPlayer key={ep.id} episode={ep} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
