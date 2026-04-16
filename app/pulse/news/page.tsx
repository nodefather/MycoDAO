"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import BreakingNewsBand from "@/components/pulse/BreakingNewsBand";
import NewsCard from "@/components/pulse/NewsCard";
import NewsHeadline from "@/components/pulse/NewsHeadline";
import NewsLiveVideo from "@/components/pulse/NewsLiveVideo";
import NewsTerminalTape from "@/components/pulse/NewsTerminalTape";
import NewsAdRail from "@/components/pulse/NewsAdRail";
import { usePulse } from "@/lib/pulse-provider";
import type { NewsWithIntelligence } from "@/lib/news-intelligence";

const CATEGORIES = ["all", "markets", "crypto", "mycodao"] as const;

export default function NewsPage() {
  const { news, tickers, enrichedNews } = usePulse();
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("all");

  const filtered =
    category === "all" ? news : news.filter((n) => n.category === category);

  const enrichedById = useMemo(() => {
    const m = new Map<string, NewsWithIntelligence>();
    enrichedNews.forEach((e) => m.set(e.id, e));
    return m;
  }, [enrichedNews]);

  const lead = filtered[0];
  const wire = filtered.slice(1);

  return (
    <div className="max-w-[1680px] mx-auto px-2 sm:px-4 py-4 pb-24 min-h-0">
      <header className="flex items-center justify-between gap-4 mb-3 border-b border-stone-800 pb-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-stone-100 font-mono tracking-tight">
            News terminal
          </h1>
          <p className="text-[11px] text-stone-500 mt-0.5">
            Live stream · tape · wire — markets, crypto, MycoDAO
          </p>
        </div>
        <Link
          href="/pulse"
          className="text-xs text-stone-500 hover:text-stone-300 shrink-0 font-mono"
        >
          ← Pulse
        </Link>
      </header>

      <BreakingNewsBand items={filtered.length ? filtered : news} />
      <NewsTerminalTape tickers={tickers} className="mb-4" />

      <div className="flex flex-col xl:flex-row gap-4 items-start">
        <div className="flex-1 min-w-0 space-y-4 w-full">
          <NewsLiveVideo />

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`px-3 py-1.5 rounded text-[11px] font-mono font-medium capitalize border ${
                  category === c
                    ? "bg-stone-800 border-stone-600 text-stone-100"
                    : "border-stone-800 text-stone-500 hover:text-stone-300 hover:border-stone-700"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {!lead && (
            <p className="text-stone-500 text-sm border border-stone-800 rounded p-4 bg-stone-950/50">
              No headlines in this category. Try &quot;all&quot; or check news API configuration.
            </p>
          )}

          {lead && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <section aria-label="Lead story" className="min-w-0">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2 font-mono">
                  Lead
                </h2>
                <NewsCard item={lead} />
              </section>

              <section aria-label="Headline wire" className="min-w-0 flex flex-col border border-stone-800 rounded bg-stone-950/40 overflow-hidden">
                <div className="px-2 py-1.5 border-b border-stone-800 bg-stone-900/80 flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 font-mono">
                    Wire
                  </span>
                  <span className="text-[10px] text-stone-600 font-mono">{wire.length}</span>
                </div>
                <div className="px-1 py-0 max-h-[min(70vh,520px)] overflow-y-auto">
                  {wire.length === 0 ? (
                    <p className="text-stone-500 text-xs p-3">No additional headlines.</p>
                  ) : (
                    wire.map((item) => (
                      <NewsHeadline
                        key={item.id}
                        item={item}
                        enriched={enrichedById.get(item.id) ?? null}
                      />
                    ))
                  )}
                </div>
              </section>
            </div>
          )}
        </div>

        <div className="w-full xl:w-auto xl:max-w-[320px]">
          <NewsAdRail />
        </div>
      </div>
    </div>
  );
}
