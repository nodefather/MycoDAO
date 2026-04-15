"use client";

import type { PodcastEpisode } from "@/lib/types";

type PodcastPlayerProps = {
  episode: PodcastEpisode;
  className?: string;
};

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function PodcastPlayer({ episode, className = "" }: PodcastPlayerProps) {
  const hasAudio = Boolean(episode.audioUrl?.trim());

  return (
    <div className={`rounded border border-stone-700 bg-stone-900/80 p-4 ${className}`}>
      <h3 className="text-sm font-semibold text-stone-200">{episode.title}</h3>
      <p className="text-xs text-stone-500 mt-1">
        {episode.show} · {formatDuration(episode.durationSec)}
      </p>
      <p className="text-xs text-stone-400 mt-2 line-clamp-2">{episode.description}</p>
      {hasAudio ? (
        <audio src={episode.audioUrl} className="mt-3 w-full" controls preload="metadata" />
      ) : (
        <p className="mt-3 text-xs text-stone-500">No audio URL for this episode.</p>
      )}
    </div>
  );
}
