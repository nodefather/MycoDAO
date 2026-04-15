"use client";

import Link from "next/link";
import Sparkline from "./Sparkline";
import type { Ticker } from "@/lib/types";

type TickerRowProps = {
  ticker: Ticker;
};

function formatPrice(price: number, symbol: string): string {
  if (["MYCO", "BIOX", "GENE", "BDM"].includes(symbol) || price < 1) return price.toFixed(4);
  if (price >= 1000) return price.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (price >= 1) return price.toFixed(2);
  return price.toFixed(4);
}

export default function TickerRow({ ticker }: TickerRowProps) {
  const up = ticker.changePct >= 0;
  const isMyco = ticker.symbol === "MYCO";

  return (
    <div
      className="grid grid-cols-[auto_1fr_auto_54px] items-center gap-1.5 py-0.5 border-b border-neutral-800 last:border-0 leading-snug tabular-nums hover:bg-neutral-900"
      data-symbol={ticker.symbol}
    >
      <div className="flex items-center gap-0.5 min-w-0">
        <span className="font-mono text-xs font-semibold text-stone-300 truncate">{ticker.symbol}</span>
        {isMyco && (
          <Link href="/token" className="text-xs hover:opacity-80 transition-opacity shrink-0" style={{ color: "var(--accent-gold)" }} title="MYCO token">
            →
          </Link>
        )}
      </div>
      <span className="font-mono text-xs text-stone-100 truncate text-right">
        {formatPrice(ticker.price, ticker.symbol)}
      </span>
      <span className={`font-mono text-xs text-right ${up ? "text-emerald-500" : "text-red-500"}`}>
        {up ? "▲" : "▼"} {up ? "+" : ""}{ticker.changePct.toFixed(2)}%
      </span>
      <div className="flex justify-end min-w-0">
        {ticker.sparkline?.length > 0 && (
          <Sparkline data={ticker.sparkline} width={52} height={14} positive={up} />
        )}
      </div>
    </div>
  );
}
