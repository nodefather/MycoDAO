"use client";

import {
  newsAdClickUrl,
  newsAdImageUrl,
  newsAdSecondaryImageUrl,
  newsAdTitle,
} from "@/lib/news-terminal-config";

type NewsAdRailProps = {
  className?: string;
};

/**
 * Sponsorship rail — only renders creative when `NEXT_PUBLIC_PULSE_NEWS_AD_IMAGE_URL` is set.
 */
export default function NewsAdRail({ className = "" }: NewsAdRailProps) {
  const img = newsAdImageUrl();
  const img2 = newsAdSecondaryImageUrl();
  const href = newsAdClickUrl();
  const title = newsAdTitle();

  return (
    <aside
      className={`flex flex-col gap-3 rounded border border-stone-800 bg-stone-900/50 p-3 w-full lg:w-[300px] xl:w-[320px] shrink-0 xl:sticky xl:top-3 xl:self-start ${className}`}
      aria-label="Sponsored"
    >
      <div className="flex items-center justify-between border-b border-stone-800 pb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Sponsor</span>
        <span className="text-[10px] text-stone-600 font-mono">ADS</span>
      </div>

      {!img && !img2 ? (
        <p className="text-xs text-stone-500 leading-relaxed">
          Ad slots are empty. Set{" "}
          <code className="text-stone-400 text-[11px]">NEXT_PUBLIC_PULSE_NEWS_AD_IMAGE_URL</code> and
          optional <code className="text-stone-400 text-[11px]">NEXT_PUBLIC_PULSE_NEWS_AD_CLICK_URL</code>.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {img && (
            <a
              href={href || undefined}
              target={href ? "_blank" : undefined}
              rel={href ? "noopener noreferrer" : undefined}
              className={`block rounded border border-stone-700 overflow-hidden bg-stone-950 ${href ? "hover:border-stone-500 transition-colors" : "cursor-default"}`}
            >
              <div className="relative w-full aspect-[16/10]">
                {/* eslint-disable-next-line @next/next/no-img-element -- env-driven sponsor URL */}
                <img
                  src={img}
                  alt={title || "Sponsor"}
                  className="h-full w-full object-cover"
                />
              </div>
              {title && (
                <p className="text-[11px] text-stone-400 px-2 py-2 border-t border-stone-800 line-clamp-2">
                  {title}
                </p>
              )}
            </a>
          )}
          {img2 && (
            <a
              href={href || undefined}
              target={href ? "_blank" : undefined}
              rel={href ? "noopener noreferrer" : undefined}
              className={`block rounded border border-stone-700 overflow-hidden bg-stone-950 ${href ? "hover:border-stone-500 transition-colors" : "cursor-default"}`}
            >
              <div className="relative w-full aspect-[16/6]">
                {/* eslint-disable-next-line @next/next/no-img-element -- env-driven sponsor URL */}
                <img src={img2} alt="" className="h-full w-full object-cover" />
              </div>
            </a>
          )}
        </div>
      )}
    </aside>
  );
}
