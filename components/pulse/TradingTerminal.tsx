"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import TradingChartPanel from "@/components/pulse/TradingChartPanel";
import OrderTicket from "@/components/pulse/OrderTicket";
import { DEFAULT_TRADING_SYMBOLS } from "@/lib/trading/default-symbols";
import type { TradingHealth } from "@/lib/trading/types";

function apiPrefix(): string {
  return (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
}

export default function TradingTerminal() {
  const [symbol, setSymbol] = useState("BTC");
  const [health, setHealth] = useState<TradingHealth | null>(null);
  const [healthErr, setHealthErr] = useState<string | null>(null);

  const loadHealth = useCallback(async () => {
    try {
      const res = await fetch(`${apiPrefix()}/api/trading/health`, { cache: "no-store" });
      const j = (await res.json()) as TradingHealth;
      setHealth(j);
      setHealthErr(null);
    } catch (e) {
      setHealthErr(String(e));
    }
  }, []);

  useEffect(() => {
    void loadHealth();
  }, [loadHealth]);

  return (
    <div className="max-w-[1600px] mx-auto px-3 sm:px-4 py-4 flex flex-col gap-4 min-h-0">
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-stone-100">Trading terminal</h1>
          <p className="text-xs text-stone-500 mt-1">
            Charts use Pulse OHLC. Orders and positions proxy to your broker service for humans and
            agents.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Link
            href="/pulse/markets"
            className="text-xs px-3 py-2 rounded border border-stone-600 text-stone-400 hover:text-stone-200 min-h-[44px] inline-flex items-center"
          >
            Markets overview
          </Link>
          <Link href="/pulse" className="text-xs text-stone-500 hover:text-stone-300 min-h-[44px] inline-flex items-center">
            ← Pulse
          </Link>
        </div>
      </header>

      {healthErr && (
        <p className="text-xs text-amber-500" role="alert">
          Health check failed: {healthErr}
        </p>
      )}
      {health && (
        <div
          className="rounded border border-stone-700 bg-stone-950/80 px-3 py-2 text-xs text-stone-400 flex flex-wrap gap-x-4 gap-y-1"
          role="status"
        >
          <span>
            Broker:{" "}
            <strong className="text-stone-200">
              {health.brokerConfigured ? "configured" : "not configured"}
            </strong>
          </span>
          <span>
            Inbound auth: <strong className="text-stone-200">{health.inboundAuth}</strong>
          </span>
          <button
            type="button"
            onClick={() => void loadHealth()}
            className="text-stone-500 hover:text-stone-300 underline min-h-[36px]"
          >
            Refresh status
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 flex-1 min-h-0">
        <section className="xl:col-span-2 flex flex-col min-h-[420px] rounded border border-stone-800 bg-stone-950/50 p-2 sm:p-3">
          <TradingChartPanel
            key={symbol}
            initialSymbol={symbol}
            symbols={DEFAULT_TRADING_SYMBOLS}
            className="min-h-[400px]"
          />
        </section>
        <aside className="xl:col-span-1 flex flex-col gap-4 min-h-0">
          <OrderTicket symbol={symbol} onSymbolChange={setSymbol} />
          <div className="rounded border border-stone-800 bg-stone-950/50 p-3 text-xs text-stone-500 space-y-2">
            <p className="font-medium text-stone-400">Agent &amp; API</p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <code className="text-stone-400">GET /api/trading/quote?symbol=BTC</code> — indicative
              </li>
              <li>
                <code className="text-stone-400">POST /api/trading/orders</code> — requires{" "}
                <code className="text-stone-400">PULSE_TRADING_API_KEY</code> or same-origin trust
              </li>
              <li>
                Broker must expose <code className="text-stone-400">/v1/orders</code>, optional{" "}
                <code className="text-stone-400">/v1/positions</code>, <code className="text-stone-400">/v1/quote</code>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
