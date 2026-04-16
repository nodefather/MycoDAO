"use client";

import { useState } from "react";
import type { OrderSide, OrderType, Venue } from "@/lib/trading/types";

function apiPrefix(): string {
  return (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
}

type OrderTicketProps = {
  symbol: string;
  onSymbolChange?: (s: string) => void;
  /** Optional: passed as X-Pulse-Trading-Key for agent-style browser tests (avoid in production). */
  tradingKey?: string;
};

export default function OrderTicket({ symbol, onSymbolChange, tradingKey }: OrderTicketProps) {
  const [side, setSide] = useState<OrderSide>("buy");
  const [type, setType] = useState<OrderType>("market");
  const [qty, setQty] = useState("0.01");
  const [limit, setLimit] = useState("");
  const [venue, setVenue] = useState<Venue>("dex");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setMsg(null);
    setErr(null);
    const q = parseFloat(qty);
    if (!Number.isFinite(q) || q <= 0) {
      setErr("Enter a valid quantity.");
      setBusy(false);
      return;
    }
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (tradingKey?.trim()) headers["X-Pulse-Trading-Key"] = tradingKey.trim();

    try {
      const res = await fetch(`${apiPrefix()}/api/trading/orders`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          symbol: symbol.toUpperCase(),
          side,
          type,
          quantity: q,
          limitPrice:
            type === "limit" && limit.trim() ? parseFloat(limit) : undefined,
          venue,
        }),
      });
      const text = await res.text();
      if (!res.ok) {
        setErr(text.slice(0, 400) || `HTTP ${res.status}`);
        return;
      }
      setMsg(text.slice(0, 400));
    } catch (e) {
      setErr(String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded border border-stone-700 bg-stone-900/90 p-4 flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-semibold text-stone-200">Order</h2>
        <p className="text-xs text-stone-500 mt-0.5">
          Proxies to <code className="text-stone-400">TRADING_BROKER_BASE_URL</code> when set. No
          simulated fills.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs text-stone-400" htmlFor="ot-symbol">
          Symbol
        </label>
        <input
          id="ot-symbol"
          value={symbol}
          onChange={(e) => onSymbolChange?.(e.target.value.toUpperCase())}
          className="bg-stone-950 border border-stone-600 rounded px-3 py-2 text-base text-stone-100 min-h-[44px]"
          autoComplete="off"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="text-xs text-stone-400">Side</span>
          <div className="flex gap-1 mt-1">
            {(["buy", "sell"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSide(s)}
                className={`flex-1 py-2 rounded text-sm min-h-[44px] border ${
                  side === s
                    ? s === "buy"
                      ? "bg-emerald-900/50 border-emerald-600 text-emerald-100"
                      : "bg-red-900/40 border-red-600 text-red-100"
                    : "bg-stone-950 border-stone-600 text-stone-400"
                }`}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-stone-400" htmlFor="ot-type">
            Type
          </label>
          <select
            id="ot-type"
            value={type}
            onChange={(e) => setType(e.target.value as OrderType)}
            className="mt-1 w-full bg-stone-950 border border-stone-600 rounded px-2 py-2 text-sm min-h-[44px]"
          >
            <option value="market">Market</option>
            <option value="limit">Limit</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs text-stone-400" htmlFor="ot-qty">
          Quantity
        </label>
        <input
          id="ot-qty"
          inputMode="decimal"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          className="mt-1 w-full bg-stone-950 border border-stone-600 rounded px-3 py-2 text-base min-h-[44px]"
        />
      </div>

      {type === "limit" && (
        <div>
          <label className="text-xs text-stone-400" htmlFor="ot-limit">
            Limit price
          </label>
          <input
            id="ot-limit"
            inputMode="decimal"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="mt-1 w-full bg-stone-950 border border-stone-600 rounded px-3 py-2 text-base min-h-[44px]"
          />
        </div>
      )}

      <div>
        <label className="text-xs text-stone-400" htmlFor="ot-venue">
          Venue target
        </label>
        <select
          id="ot-venue"
          value={venue}
          onChange={(e) => setVenue(e.target.value as Venue)}
          className="mt-1 w-full bg-stone-950 border border-stone-600 rounded px-2 py-2 text-sm min-h-[44px]"
        >
          <option value="dex">DEX / on-chain</option>
          <option value="cex">CEX</option>
          <option value="simulation">Simulation / paper (broker-defined)</option>
        </select>
      </div>

      <button
        type="button"
        onClick={() => void submit()}
        disabled={busy}
        className="w-full py-3 rounded bg-stone-700 hover:bg-stone-600 text-stone-100 text-sm font-medium min-h-[48px] disabled:opacity-50"
      >
        {busy ? "Submitting…" : "Submit order"}
      </button>

      {err && (
        <p className="text-xs text-red-400 whitespace-pre-wrap break-words" role="alert">
          {err}
        </p>
      )}
      {msg && (
        <p className="text-xs text-stone-400 whitespace-pre-wrap break-words">
          {msg}
        </p>
      )}
    </div>
  );
}
