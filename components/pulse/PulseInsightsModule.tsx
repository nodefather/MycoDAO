"use client";

import PulseModule from "./PulseModule";
import { usePulse } from "@/lib/pulse-provider";

export default function PulseInsightsModule() {
  const { moverInsights, headlineInsights, unifiedEvents } = usePulse();
  const movers = moverInsights.slice(0, 2);
  const heads = headlineInsights.slice(0, 2);
  const topEvents = unifiedEvents.slice(0, 3);

  const hasAny = movers.length > 0 || heads.length > 0 || topEvents.length > 0;

  return (
    <PulseModule title="Intelligence">
      {!hasAny ? (
        <div className="text-xs text-stone-500">Load market and news data to generate insights.</div>
      ) : (
        <div className="space-y-1.5 text-xs leading-tight">
          {movers.map((m) => (
            <div key={m.tickerId} className="border-b border-neutral-800/80 pb-1 last:border-0">
              <div className="font-mono text-amber-500/90">{m.symbol}</div>
              <div className="text-stone-300 truncate" title={m.summary}>
                {m.summary}
              </div>
            </div>
          ))}
          {heads.map((h) => (
            <div key={h.id} className="border-b border-neutral-800/80 pb-1 last:border-0">
              <div className="text-stone-400 truncate" title={h.title}>
                {h.title}
              </div>
            </div>
          ))}
          {topEvents.length > 0 && (
            <div className="text-stone-500 font-mono text-xs pt-0.5">
              Events: {topEvents.map((e) => e.title.slice(0, 28)).join(" · ")}
            </div>
          )}
        </div>
      )}
    </PulseModule>
  );
}
