"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ColorType,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import { DEFAULT_TRADING_SYMBOLS } from "@/lib/trading/default-symbols";

const INTERVALS = ["1m", "5m", "15m", "60m", "1D", "1W"] as const;
export type TradingChartInterval = (typeof INTERVALS)[number];

function apiPrefix(): string {
  return (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
}

export interface TradingChartPanelProps {
  initialSymbol?: string;
  symbols?: readonly string[];
  className?: string;
}

/**
 * Candlesticks + volume histogram; data from `/api/ohlc` (Finnhub / CoinGecko / MINDEX).
 */
export default function TradingChartPanel({
  initialSymbol = "BTC",
  symbols = DEFAULT_TRADING_SYMBOLS,
  className = "",
}: TradingChartPanelProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const [symbol, setSymbol] = useState(initialSymbol.toUpperCase());
  const [interval, setInterval] = useState<TradingChartInterval>("1D");
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
        setErr(json.error ?? "No OHLC data. Configure FINNHUB_API_KEY or MINDEX OHLC.");
        candleRef.current?.setData([]);
        volRef.current?.setData([]);
        return;
      }
      const candles = bars.map((b) => ({
        time: b.time as UTCTimestamp,
        open: b.open,
        high: b.high,
        low: b.low,
        close: b.close,
      }));
      const vols = bars.map((b) => {
        const up = b.close >= b.open;
        return {
          time: b.time as UTCTimestamp,
          value: typeof b.volume === "number" && b.volume > 0 ? b.volume : 0,
          color: up ? "rgba(5, 150, 105, 0.45)" : "rgba(220, 38, 38, 0.45)",
        };
      });
      candleRef.current?.setData(candles);
      volRef.current?.setData(vols);
      setMeta(json.source ? `Source: ${json.source}` : null);
    } catch (e) {
      setErr(String(e));
      candleRef.current?.setData([]);
      volRef.current?.setData([]);
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

    const candle = chart.addCandlestickSeries({
      upColor: "#059669",
      downColor: "#dc2626",
      borderVisible: false,
      wickUpColor: "#059669",
      wickDownColor: "#dc2626",
    });

    const vol = chart.addHistogramSeries({
      priceFormat: { type: "volume" },
      priceScaleId: "",
    });
    vol.priceScale().applyOptions({
      scaleMargins: { top: 0.75, bottom: 0 },
    });
    candle.priceScale().applyOptions({
      scaleMargins: { top: 0.1, bottom: 0.25 },
    });

    chartRef.current = chart;
    candleRef.current = candle;
    volRef.current = vol;

    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      chart.applyOptions({ width: Math.floor(r.width), height: Math.floor(r.height) });
    });
    ro.observe(el);
    const rect = el.getBoundingClientRect();
    chart.applyOptions({
      width: Math.floor(rect.width) || 400,
      height: Math.floor(rect.height) || 420,
    });

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      candleRef.current = null;
      volRef.current = null;
    };
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const fit = () => {
    chartRef.current?.timeScale().fitContent();
  };

  return (
    <div className={`flex flex-col h-full min-h-[320px] gap-2 ${className}`}>
      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
        <label className="sr-only" htmlFor="trade-chart-symbol">
          Symbol
        </label>
        <select
          id="trade-chart-symbol"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          className="bg-stone-900 border border-stone-600 rounded px-2 py-2 text-sm text-stone-200 min-h-[44px]"
        >
          {symbols.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <div className="flex flex-wrap gap-1" role="group" aria-label="Interval">
          {INTERVALS.map((iv) => (
            <button
              key={iv}
              type="button"
              onClick={() => setInterval(iv)}
              className={`px-3 py-2 rounded text-xs min-h-[44px] min-w-[44px] border ${
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
          onClick={fit}
          className="px-3 py-2 text-sm border border-stone-600 rounded bg-stone-900 text-stone-300 hover:text-stone-100 min-h-[44px]"
        >
          Fit
        </button>
        {loading && <span className="text-xs text-stone-500">Loading…</span>}
        {meta && (
          <span className="text-xs text-stone-500 truncate max-w-[180px]" title={meta}>
            {meta}
          </span>
        )}
      </div>
      {err && (
        <p className="text-xs text-amber-500/90 shrink-0" role="alert">
          {err}
        </p>
      )}
      <div
        ref={containerRef}
        className="flex-1 min-h-[360px] w-full rounded border border-stone-700 bg-stone-950"
      />
    </div>
  );
}
