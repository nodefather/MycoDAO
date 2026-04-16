"use client";

import { newsStreamLabel, newsVideoEmbedUrl } from "@/lib/news-terminal-config";

/**
 * Live stream via iframe embed (YouTube Live, Vimeo, Cloudflare Stream, etc.).
 * Set `NEXT_PUBLIC_PULSE_NEWS_VIDEO_EMBED_URL` — no placeholder video.
 */
export default function NewsLiveVideo() {
  const embedUrl = newsVideoEmbedUrl();
  const label = newsStreamLabel();

  return (
    <section
      className="flex flex-col rounded border border-stone-700 bg-stone-950 overflow-hidden min-h-0"
      aria-label="Live video stream"
    >
      <div className="flex items-center justify-between gap-2 px-2 py-1.5 border-b border-stone-800 bg-stone-900/90 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="flex items-center gap-1.5 shrink-0"
            aria-hidden
          >
            <span className="h-2 w-2 rounded-full bg-red-500 motion-reduce:animate-none animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">Live</span>
          </span>
          {label && (
            <span className="text-[11px] font-mono text-stone-400 truncate" title={label}>
              {label}
            </span>
          )}
        </div>
        <span className="text-[10px] text-stone-600 font-mono shrink-0 hidden sm:inline">VIDEO</span>
      </div>

      <div className="relative w-full aspect-video bg-black">
        {embedUrl ? (
          <iframe
            title="Live news stream"
            src={embedUrl}
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
            <p className="text-sm text-stone-400 font-medium">No stream configured</p>
            <p className="text-xs text-stone-600 max-w-md">
              Set <code className="text-stone-500">NEXT_PUBLIC_PULSE_NEWS_VIDEO_EMBED_URL</code> to a
              provider embed URL (e.g. YouTube Live, Cloudflare Stream, Vimeo). Rebuild after changing
              env.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
