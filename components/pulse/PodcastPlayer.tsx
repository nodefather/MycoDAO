"use client";

import type { PodcastEpisode } from "@/lib/types";
import { episodeHasAudioFile } from "@/lib/podcast-episode-utils";

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
  const ep = episode;
  const embed = ep.embedUrl?.trim() || "";
  const hasEmbed = Boolean(embed);
  const hasVideoFile =
    ep.mediaKind === "video" &&
    ep.audioUrl &&
    ep.audioUrl !== "#" &&
    /\.(mp4|webm|m3u8|mov)(\?|$)/i.test(ep.audioUrl);
  const hasAudio = episodeHasAudioFile(ep);

  return (
    <div className={`rounded border border-stone-700 bg-stone-900/80 p-4 ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-stone-200 min-w-0">{ep.title}</h3>
        <span className="shrink-0 text-[10px] font-mono uppercase text-stone-500">
          {ep.mediaKind === "video" ? "VOD" : "Audio"}
        </span>
      </div>
      <p className="text-xs text-stone-500 mt-1">
        {ep.show} · {formatDuration(ep.durationSec)}
      </p>
      <p className="text-xs text-stone-400 mt-2 line-clamp-3">{ep.description}</p>

      {hasEmbed && (
        <div className="mt-3 relative w-full aspect-video rounded overflow-hidden border border-stone-800 bg-black">
          <iframe
            title={ep.title}
            src={embed}
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      )}

      {!hasEmbed && hasVideoFile && (
        <video
          src={ep.audioUrl}
          className="mt-3 w-full rounded border border-stone-800"
          controls
          preload="metadata"
        />
      )}

      {hasAudio && (
        <>
          {hasEmbed && ep.mediaKind === "video" && (
            <p className="mt-2 text-[10px] text-stone-500 font-mono uppercase tracking-wide">Audio feed</p>
          )}
          <audio src={ep.audioUrl} className="mt-2 w-full" controls preload="metadata" />
        </>
      )}

      {!hasEmbed && !hasVideoFile && !hasAudio && (
        <p className="mt-3 text-xs text-stone-500">No playable URL in the feed for this episode.</p>
      )}
    </div>
  );
}
