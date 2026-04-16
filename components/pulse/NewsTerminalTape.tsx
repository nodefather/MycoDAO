"use client";

import type { Ticker } from "@/lib/types";
import { newsTapeSymbolsFromEnv } from "@/lib/news-terminal-config";

function formatPrice(price: number, symbol: string): string {
  if (["MYCO", "BIOX", "GENE"].includes(symbol) || price < 1) return price.toFixed(4);
  if (price >= 1000) return price.toLocaleString(undefined, { maximumFractionDigits: 0 });
  return price.toFixed(2);
}

type NewsTerminalTapeProps = {
  tickers: Ticker[];
  className?: string;
};

/**
 * Full-width market tape: symbols from env or defaults, prices from live Pulse tickers.
 */
export default function NewsTerminalTape({ tickers, className = "" }: NewsTerminalTapeProps) {
  const want = newsTapeSymbolsFromEnv();
  const bySym = new Map(tickers.map((t) => [t.symbol, t]));
  const row = want.map((s) => bySym.get(s)).filter(Boolean) as Ticker[];

  return (
    <div
      className={`border-y border-stone-700 bg-stone-950 font-mono text-[11px] sm:text-xs ${className}`}
      aria-label="Market tape"
    >
      <div className="flex items-stretch min-h-[36px]">
        <div className="shrink-0 flex items-center px-2 border-r border-stone-800 bg-stone-900/95 text-stone-500 text-[10px] font-bold uppercase tracking-tight">
          Mkts
        </div>
        <div className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-thin">
          <div className="flex items-center gap-x-4 gap-y-1 px-2 py-1.5 whitespace-nowrap min-w-min">
            {row.length === 0 ? (
              <span className="text-stone-500">
                No ticker data — configure market data APIs or wait for feed.
              </span>
            ) : (
              row.map((t) => {
                const up = t.changePct >= 0;
                return (
                  <span key={t.id} className="inline-flex items-center gap-1.5 shrink-0 tabular-nums">
                    <span className="font-semibold text-stone-300">{t.symbol}</span>
                    <span className="text-stone-200">{formatPrice(t.price, t.symbol)}</span>
                    <span className={up ? "text-emerald-500" : "text-red-500"}>
                      {up ? "▲" : "▼"}
                      {up ? "+" : ""}
                      {t.changePct.toFixed(2)}%
                    </span>
                  </span>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
