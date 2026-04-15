/**
 * Tickers: CoinGecko (crypto), Finnhub (US equities/ETFs when FINNHUB_API_KEY),
 * DexScreener for MYCO mint. Mock merge only when ALLOW_MOCK_FALLBACK.
 */

import type { Ticker } from "@/lib/types";
import { getMockTickers } from "@/lib/mock-data";
import { allowMockFallback, tickerCacheTtlMs } from "@/lib/server/pulse-env";

let cached: Ticker[] | null = null;
let cachedAt = 0;

export function invalidateTickerCache(): void {
  cached = null;
  cachedAt = 0;
}

/** Whether a call to `fetchTickers()` without bypass would return cached rows. */
export function peekTickerCacheFresh(): boolean {
  const ttl = tickerCacheTtlMs();
  return ttl > 0 && cached !== null && Date.now() - cachedAt < ttl;
}

export type FetchTickersOptions = {
  /** When true, skip read-through cache (still writes cache after fetch). */
  bypassCache?: boolean;
};

/** CoinGecko `/simple/price` ids — expand as needed. */
const COINGECKO_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  AVAX: "avalanche-2",
  LINK: "chainlink",
  UNI: "uniswap",
  DOT: "polkadot",
  ATOM: "cosmos",
  XRP: "ripple",
  ADA: "cardano",
  DOGE: "dogecoin",
  LTC: "litecoin",
  BNB: "binancecoin",
  MATIC: "matic-network",
  NEAR: "near",
  ARB: "arbitrum",
  OP: "optimism",
  INJ: "injective-protocol",
  TIA: "celestia",
  SUI: "sui",
  SEI: "sei-network",
};

/** Finnhub `quote` symbols (US). BRK.B → BRK-B. */
const FINNHUB_SYMBOL_MAP: Record<string, string> = {
  "BRK.B": "BRK-B",
  SPY: "SPY",
  QQQ: "QQQ",
  DXY: "UUP",
  VIX: "^VIX",
  US10Y: "IEF",
  AAPL: "AAPL",
  MSFT: "MSFT",
  NVDA: "NVDA",
  AMZN: "AMZN",
  GOOGL: "GOOGL",
  META: "META",
  JPM: "JPM",
  GS: "GS",
  V: "V",
  MA: "MA",
  UNH: "UNH",
  GOLD: "GLD",
  SILVER: "SLV",
  COPPER: "CPER",
  OIL: "USO",
};

type CgPrice = Record<string, { usd: number; usd_24h_change?: number }>;

function mergeCoinGeckoIntoMock(mock: Ticker[], data: CgPrice): Ticker[] {
  const now = new Date().toISOString();
  return mock.map((t) => {
    const id = COINGECKO_IDS[t.symbol];
    const raw = id ? data[id] : null;
    if (!raw || typeof raw.usd !== "number") return t;
    const changePct = raw.usd_24h_change != null ? raw.usd_24h_change : t.changePct;
    const change = (raw.usd * changePct) / 100;
    return {
      ...t,
      price: raw.usd,
      changePct,
      change,
      updatedAt: now,
      sessionChangePct: raw.usd_24h_change ?? t.sessionChangePct,
    };
  });
}

async function fetchCoinGeckoPrices(): Promise<CgPrice | null> {
  const ids = Array.from(new Set(Object.values(COINGECKO_IDS))).join(",");
  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
    { cache: "no-store", signal: AbortSignal.timeout(12_000) }
  );
  if (!res.ok) return null;
  return (await res.json()) as CgPrice;
}

type FinnhubQuote = { c?: number; dp?: number };

async function mergeFinnhub(mock: Ticker[], apiKey: string): Promise<{ tickers: Ticker[]; updated: boolean }> {
  const now = new Date().toISOString();
  const bySymbol = new Map(mock.map((t) => [t.symbol, { ...t }]));
  const symbols = Array.from(new Set(mock.map((t) => t.symbol))).filter((s) => FINNHUB_SYMBOL_MAP[s]);
  let updated = false;
  await Promise.all(
    symbols.map(async (sym) => {
      const fhSym = FINNHUB_SYMBOL_MAP[sym];
      if (!fhSym) return;
      try {
        const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(fhSym)}&token=${apiKey}`;
        const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(5000) });
        if (!res.ok) return;
        const q = (await res.json()) as FinnhubQuote;
        if (typeof q.c !== "number" || !Number.isFinite(q.c)) return;
        const t = bySymbol.get(sym);
        if (!t) return;
        const changePct = typeof q.dp === "number" ? q.dp : t.changePct;
        const change = (q.c * changePct) / 100;
        updated = true;
        bySymbol.set(sym, {
          ...t,
          price: q.c,
          changePct,
          change,
          updatedAt: now,
          sessionChangePct: changePct,
        });
      } catch {
        /* skip symbol */
      }
    })
  );
  return { tickers: mock.map((t) => bySymbol.get(t.symbol) || t), updated };
}

async function mergeDexMyco(mock: Ticker[], mint: string): Promise<{ tickers: Ticker[]; updated: boolean }> {
  try {
    const url = `https://api.dexscreener.com/latest/dex/tokens/${mint}`;
    const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (!res.ok) return { tickers: mock, updated: false };
    const data = (await res.json()) as { pairs?: Array<{ priceUsd?: string; priceChange?: { h24?: number } }> };
    const pair = data.pairs?.[0];
    if (!pair?.priceUsd) return { tickers: mock, updated: false };
    const price = parseFloat(pair.priceUsd);
    const changePct = pair.priceChange?.h24 ?? 0;
    if (!Number.isFinite(price)) return { tickers: mock, updated: false };
    const now = new Date().toISOString();
    return {
      updated: true,
      tickers: mock.map((t) =>
        t.symbol === "MYCO"
          ? {
              ...t,
              price,
              changePct,
              change: (price * changePct) / 100,
              updatedAt: now,
              sessionChangePct: changePct,
            }
          : t
      ),
    };
  } catch {
    return { tickers: mock, updated: false };
  }
}

export async function fetchTickers(opts?: FetchTickersOptions): Promise<Ticker[]> {
  const ttl = tickerCacheTtlMs();
  if (!opts?.bypassCache && ttl > 0 && cached && Date.now() - cachedAt < ttl) {
    return cached;
  }
  if (opts?.bypassCache) {
    invalidateTickerCache();
  }

  const mock = getMockTickers();
  let out: Ticker[] = mock;
  let gotLive = false;

  try {
    const cg = await fetchCoinGeckoPrices();
    if (cg && Object.keys(cg).length > 0) {
      out = mergeCoinGeckoIntoMock(out, cg);
      gotLive = true;
    }
  } catch {
    /* continue */
  }

  const finnhubKey = process.env.FINNHUB_API_KEY?.trim();
  if (finnhubKey) {
    try {
      const fh = await mergeFinnhub(out, finnhubKey);
      out = fh.tickers;
      if (fh.updated) gotLive = true;
    } catch {
      /* keep out */
    }
  }

  const mycoMint = process.env.MYCO_SOLANA_MINT?.trim();
  if (mycoMint) {
    const dx = await mergeDexMyco(out, mycoMint);
    out = dx.tickers;
    if (dx.updated) gotLive = true;
  }

  if (gotLive) {
    cached = out;
    cachedAt = Date.now();
    return out;
  }

  if (allowMockFallback()) {
    cached = mock;
    cachedAt = Date.now();
    return mock;
  }

  cached = null;
  return [];
}
