"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ColorType,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";

const DEFAULT_SYMBOLS = ["BTC", "ETH", "SOL", "SPY", "AAPL", "NVDA"] as const;
const INTERVALS = ["5m", "15m", "60m", "1D", "1W"] as const;
export type ChartInterval = (typeof INTERVALS)[number];

function apiPrefix(): string {
  return (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
}

export interface MarketChartProps {
  /** Initial symbol (uppercase ticker). */
  initialSymbol?: string;
  /** Optional extra symbols in the selector. */
  symbols?: readonly string[];
}

export default function MarketChart({
  initialSymbol = "BTC",
  symbols = DEFAULT_SYMBOLS,
}: MarketChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [symbol, setSymbol] = useState(initialSymbol.toUpperCase());
  const [interval, setInterval] = useState<ChartInterval>("1D");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [meta, setMeta] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    setMeta(null);
    try {
      const q = new URLSearchParams({ symbol, interval });
      const res = await fetch(`${apiPrefix()}/api/ohlc?${q.toString()}`, {
        cache: "no-store",
      });
      const json = (await res.json()) as {
        bars?: Array<{
          time: number;
          open: number;
          high: number;
          low: number;
          close: number;
          volume?: number;
        }>;
        source?: string | null;
        error?: string | null;
      };
      const bars = json.bars ?? [];
      if (!bars.length) {
        setErr(json.error ?? "No OHLC data. Set FINNHUB_API_KEY or use a supported symbol.");
        seriesRef.current?.setData([]);
        return;
      }
      const data = bars.map((b) => ({
        time: b.time as UTCTimestamp,
        open: b.open,
        high: b.high,
        low: b.low,
        close: b.close,
      }));
      seriesRef.current?.setData(data);
      setMeta(json.source ? `Source: ${json.source}` : null);
    } catch (e) {
      setErr(String(e));
      seriesRef.current?.setData([]);
    } finally {
      setLoading(false);
    }
  }, [symbol, interval]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chart = createChart(el, {
      layout: {
        background: { type: ColorType.Solid, color: "#0c0a09" },
        textColor: "#a8a29e",
      },
      grid: {
        vertLines: { color: "#292524" },
        horzLines: { color: "#292524" },
      },
      rightPriceScale: { borderColor: "#44403c" },
      timeScale: { borderColor: "#44403c" },
      crosshair: { mode: 1 },
    });

    const series = chart.addCandlestickSeries({
      upColor: "#059669",
      downColor: "#dc2626",
      borderVisible: false,
      wickUpColor: "#059669",
      wickDownColor: "#dc2626",
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      chart.applyOptions({ width: Math.floor(r.width), height: Math.floor(r.height) });
    });
    ro.observe(el);
    const rect = el.getBoundingClientRect();
    chart.applyOptions({
      width: Math.floor(rect.width) || 400,
      height: Math.floor(rect.height) || 320,
    });

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const resetScale = () => {
    chartRef.current?.timeScale().fitContent();
  };

  return (
    <div className="flex flex-col h-full min-h-[280px] gap-1.5">
      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
        <label className="sr-only" htmlFor="chart-symbol">
          Symbol
        </label>
        <select
          id="chart-symbol"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          className="bg-stone-900 border border-stone-600 rounded px-2 py-1.5 text-xs text-stone-200 min-h-[36px]"
        >
          {symbols.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <div className="flex flex-wrap gap-0.5" role="group" aria-label="Interval">
          {INTERVALS.map((iv) => (
            <button
              key={iv}
              type="button"
              onClick={() => setInterval(iv)}
              className={`px-2 py-1.5 rounded text-xs min-h-[36px] min-w-[44px] border ${
                interval === iv
                  ? "bg-stone-700 text-stone-100 border-stone-500"
                  : "bg-stone-900 text-stone-400 border-stone-600 hover:text-stone-200"
              }`}
            >
              {iv}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={resetScale}
          className="px-2 py-1.5 text-xs border border-stone-600 rounded bg-stone-900 text-stone-300 hover:text-stone-100 min-h-[36px]"
        >
          Fit
        </button>
        {loading && <span className="text-xs text-stone-500">Loading…</span>}
        {meta && <span className="text-xs text-stone-500 truncate max-w-[140px]">{meta}</span>}
      </div>
      {err && (
        <p className="text-xs text-amber-500/90 shrink-0" role="alert">
          {err}
        </p>
      )}
      <div ref={containerRef} className="flex-1 min-h-[240px] w-full rounded border border-stone-700 bg-stone-950" />
    </div>
  );
}
