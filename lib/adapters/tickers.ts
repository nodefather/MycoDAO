/**
 * Tickers: CoinGecko (crypto), Finnhub (US equities/ETFs when FINNHUB_API_KEY),
 * DexScreener for MYCO when MYCO_SOLANA_MINT is set. No synthetic prices.
 */

import type { Ticker } from "@/lib/types";
import { tickerCacheTtlMs } from "@/lib/server/pulse-env";

let cached: Ticker[] | null = null;
let cachedAt = 0;

export function invalidateTickerCache(): void {
  cached = null;
  cachedAt = 0;
}

export function peekTickerCacheFresh(): boolean {
  const ttl = tickerCacheTtlMs();
  return ttl > 0 && cached !== null && Date.now() - cachedAt < ttl;
}

export type FetchTickersOptions = {
  bypassCache?: boolean;
};

/** CoinGecko `/simple/price` ids */
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

const CRYPTO_META: Record<string, { name: string; assetClass: Ticker["assetClass"] }> = {
  BTC: { name: "Bitcoin", assetClass: "crypto" },
  ETH: { name: "Ethereum", assetClass: "crypto" },
  SOL: { name: "Solana", assetClass: "crypto" },
  AVAX: { name: "Avalanche", assetClass: "crypto" },
  LINK: { name: "Chainlink", assetClass: "crypto" },
  UNI: { name: "Uniswap", assetClass: "crypto" },
  DOT: { name: "Polkadot", assetClass: "crypto" },
  ATOM: { name: "Cosmos", assetClass: "crypto" },
  XRP: { name: "Ripple", assetClass: "crypto" },
  ADA: { name: "Cardano", assetClass: "crypto" },
  DOGE: { name: "Dogecoin", assetClass: "crypto" },
  LTC: { name: "Litecoin", assetClass: "crypto" },
  BNB: { name: "BNB", assetClass: "crypto" },
  MATIC: { name: "Polygon", assetClass: "crypto" },
  NEAR: { name: "NEAR", assetClass: "crypto" },
  ARB: { name: "Arbitrum", assetClass: "crypto" },
  OP: { name: "Optimism", assetClass: "crypto" },
  INJ: { name: "Injective", assetClass: "crypto" },
  TIA: { name: "Celestia", assetClass: "crypto" },
  SUI: { name: "Sui", assetClass: "crypto" },
  SEI: { name: "Sei", assetClass: "crypto" },
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

const FINNHUB_META: Record<string, { name: string; assetClass: Ticker["assetClass"] }> = {
  "BRK.B": { name: "Berkshire Hathaway", assetClass: "equity" },
  SPY: { name: "S&P 500 ETF", assetClass: "equity" },
  QQQ: { name: "Nasdaq 100 ETF", assetClass: "equity" },
  DXY: { name: "US Dollar Index (proxy)", assetClass: "forex" },
  VIX: { name: "VIX Volatility", assetClass: "equity" },
  US10Y: { name: "10Y Treasury (proxy)", assetClass: "forex" },
  AAPL: { name: "Apple", assetClass: "equity" },
  MSFT: { name: "Microsoft", assetClass: "equity" },
  NVDA: { name: "NVIDIA", assetClass: "equity" },
  AMZN: { name: "Amazon", assetClass: "equity" },
  GOOGL: { name: "Alphabet", assetClass: "equity" },
  META: { name: "Meta", assetClass: "equity" },
  JPM: { name: "JPMorgan", assetClass: "equity" },
  GS: { name: "Goldman Sachs", assetClass: "equity" },
  V: { name: "Visa", assetClass: "equity" },
  MA: { name: "Mastercard", assetClass: "equity" },
  UNH: { name: "UnitedHealth", assetClass: "equity" },
  GOLD: { name: "Gold (GLD)", assetClass: "precious_metals" },
  SILVER: { name: "Silver (SLV)", assetClass: "precious_metals" },
  COPPER: { name: "Copper (CPER)", assetClass: "commodity" },
  OIL: { name: "WTI Crude (USO)", assetClass: "commodity" },
};

type CgPrice = Record<string, { usd: number; usd_24h_change?: number }>;

async function fetchCoinGeckoPrices(): Promise<CgPrice | null> {
  const ids = Array.from(new Set(Object.values(COINGECKO_IDS))).join(",");
  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
    { cache: "no-store", signal: AbortSignal.timeout(12_000) }
  );
  if (!res.ok) return null;
  return (await res.json()) as CgPrice;
}

function tickersFromCoinGecko(data: CgPrice): Ticker[] {
  const now = new Date().toISOString();
  const out: Ticker[] = [];
  for (const [symbol, id] of Object.entries(COINGECKO_IDS)) {
    const raw = data[id];
    const meta = CRYPTO_META[symbol];
    if (!raw || typeof raw.usd !== "number" || !meta) continue;
    const changePct = typeof raw.usd_24h_change === "number" ? raw.usd_24h_change : 0;
    const price = raw.usd;
    const change = (price * changePct) / 100;
    const sparkline = Array.from({ length: 24 }, () => price);
    out.push({
      id: symbol,
      symbol,
      name: meta.name,
      assetClass: meta.assetClass,
      currency: "USD",
      price,
      change,
      changePct,
      sessionChangePct: changePct,
      sparkline,
      updatedAt: now,
    });
  }
  return out;
}

type FinnhubQuote = { c?: number; dp?: number };

async function tickersFromFinnhub(apiKey: string): Promise<Ticker[]> {
  const now = new Date().toISOString();
  const out: Ticker[] = [];
  const symbols = Object.keys(FINNHUB_SYMBOL_MAP);
  await Promise.all(
    symbols.map(async (sym) => {
      const fhSym = FINNHUB_SYMBOL_MAP[sym];
      const meta = FINNHUB_META[sym];
      if (!fhSym || !meta) return;
      try {
        const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(fhSym)}&token=${apiKey}`;
        const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(5000) });
        if (!res.ok) return;
        const q = (await res.json()) as FinnhubQuote;
        if (typeof q.c !== "number" || !Number.isFinite(q.c)) return;
        const changePct = typeof q.dp === "number" ? q.dp : 0;
        const price = q.c;
        const change = (price * changePct) / 100;
        const sparkline = Array.from({ length: 24 }, () => price);
        out.push({
          id: sym,
          symbol: sym,
          name: meta.name,
          assetClass: meta.assetClass,
          currency: "USD",
          price,
          change,
          changePct,
          sessionChangePct: changePct,
          sparkline,
          updatedAt: now,
        });
      } catch {
        /* skip */
      }
    })
  );
  return out;
}

async function tickerFromDexMyco(mint: string): Promise<Ticker | null> {
  try {
    const url = `https://api.dexscreener.com/latest/dex/tokens/${mint}`;
    const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const data = (await res.json()) as { pairs?: Array<{ priceUsd?: string; priceChange?: { h24?: number } }> };
    const pair = data.pairs?.[0];
    if (!pair?.priceUsd) return null;
    const price = parseFloat(pair.priceUsd);
    const changePct = pair.priceChange?.h24 ?? 0;
    if (!Number.isFinite(price)) return null;
    const now = new Date().toISOString();
    const change = (price * changePct) / 100;
    const sparkline = Array.from({ length: 24 }, () => price);
    return {
      id: "MYCO",
      symbol: "MYCO",
      name: "MYCO",
      assetClass: "bio",
      currency: "USD",
      price,
      changePct,
      change,
      sessionChangePct: changePct,
      sparkline,
      updatedAt: now,
    };
  } catch {
    return null;
  }
}

export async function fetchTickers(opts?: FetchTickersOptions): Promise<Ticker[]> {
  const ttl = tickerCacheTtlMs();
  if (!opts?.bypassCache && ttl > 0 && cached !== null && Date.now() - cachedAt < ttl) {
    return cached;
  }
  if (opts?.bypassCache) {
    invalidateTickerCache();
  }

  const bySymbol = new Map<string, Ticker>();

  try {
    const cg = await fetchCoinGeckoPrices();
    if (cg && Object.keys(cg).length > 0) {
      for (const t of tickersFromCoinGecko(cg)) {
        bySymbol.set(t.symbol, t);
      }
    }
  } catch {
    /* continue */
  }

  const finnhubKey = process.env.FINNHUB_API_KEY?.trim();
  if (finnhubKey) {
    try {
      const fh = await tickersFromFinnhub(finnhubKey);
      for (const t of fh) {
        bySymbol.set(t.symbol, t);
      }
    } catch {
      /* continue */
    }
  }

  const mycoMint = process.env.MYCO_SOLANA_MINT?.trim();
  if (mycoMint) {
    const row = await tickerFromDexMyco(mycoMint);
    if (row) {
      bySymbol.set("MYCO", row);
    }
  }

  const out = Array.from(bySymbol.values());

  if (out.length === 0) {
    cached = null;
    return [];
  }

  cached = out;
  cachedAt = Date.now();
  return out;
}
