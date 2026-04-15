/**
 * OHLC series for Pulse chart: Finnhub (stocks + crypto candles when FINNHUB_API_KEY),
 * CoinGecko OHLC as crypto fallback (daily candles, no API key).
 */

import { mindexApiBase, mindexInternalHeaders } from "@/lib/server/pulse-env";

export interface OhlcBar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

/** Finnhub `quote` / candle symbol map (US equities, ETFs). */
const FINNHUB_STOCK: Record<string, string> = {
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

/** Major crypto → Finnhub `crypto/candle` symbol (BINANCE pair). */
const FINNHUB_CRYPTO: Record<string, string> = {
  BTC: "BINANCE:BTCUSDT",
  ETH: "BINANCE:ETHUSDT",
  SOL: "BINANCE:SOLUSDT",
  AVAX: "BINANCE:AVAXUSDT",
  LINK: "BINANCE:LINKUSDT",
  UNI: "BINANCE:UNIUSDT",
  DOT: "BINANCE:DOTUSDT",
  ATOM: "BINANCE:ATOMUSDT",
  XRP: "BINANCE:XRPUSDT",
  ADA: "BINANCE:ADAUSDT",
  DOGE: "BINANCE:DOGEUSDT",
  LTC: "BINANCE:LTCUSDT",
  BNB: "BINANCE:BNBUSDT",
  MATIC: "BINANCE:MATICUSDT",
  NEAR: "BINANCE:NEARUSDT",
  ARB: "BINANCE:ARBUSDT",
  OP: "BINANCE:OPUSDT",
  INJ: "BINANCE:INJUSDT",
  TIA: "BINANCE:TIAUSDT",
  SUI: "BINANCE:SUIUSDT",
  SEI: "BINANCE:SEIUSDT",
};

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

const INTERVAL_TO_FINNHUB: Record<string, string> = {
  "1m": "1",
  "5m": "5",
  "15m": "15",
  "30m": "30",
  "60m": "60",
  "1D": "D",
  "1W": "W",
};

export type OhlcFetchResult = {
  bars: OhlcBar[];
  source: string | null;
  error?: string;
};

function mergeFinnhubCandles(data: {
  s?: string;
  t?: number[];
  o?: number[];
  h?: number[];
  l?: number[];
  c?: number[];
  v?: number[];
}): OhlcBar[] {
  if (data.s !== "ok" || !data.t?.length) return [];
  const out: OhlcBar[] = [];
  for (let i = 0; i < data.t.length; i++) {
    const t = data.t[i];
    const o = data.o?.[i];
    const h = data.h?.[i];
    const l = data.l?.[i];
    const c = data.c?.[i];
    const v = data.v?.[i];
    if (
      typeof t !== "number" ||
      typeof o !== "number" ||
      typeof h !== "number" ||
      typeof l !== "number" ||
      typeof c !== "number"
    ) {
      continue;
    }
    out.push({
      time: t,
      open: o,
      high: h,
      low: l,
      close: c,
      volume: typeof v === "number" ? v : undefined,
    });
  }
  return out;
}

async function fetchFinnhubCandle(
  apiKey: string,
  endpoint: "stock" | "crypto",
  symbol: string,
  resolution: string
): Promise<OhlcBar[] | null> {
  const now = Math.floor(Date.now() / 1000);
  let from = now - 7 * 86400;
  if (resolution === "D") from = now - 365 * 86400;
  if (resolution === "W") from = now - 730 * 86400;
  if (["1", "5", "15", "30", "60"].includes(resolution)) {
    from = now - 7 * 86400;
  }

  const path = endpoint === "stock" ? "stock/candle" : "crypto/candle";
  const url = `https://finnhub.io/api/v1/${path}?symbol=${encodeURIComponent(symbol)}&resolution=${resolution}&from=${from}&to=${now}&token=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(15_000) });
  if (!res.ok) return null;
  const json = (await res.json()) as Parameters<typeof mergeFinnhubCandles>[0];
  const bars = mergeFinnhubCandles(json);
  return bars.length ? bars : null;
}

async function fetchCoinGeckoOhlc(symbol: string, days: 1 | 7 | 30 | 90): Promise<OhlcBar[] | null> {
  const id = COINGECKO_IDS[symbol];
  if (!id) return null;
  const url = `https://api.coingecko.com/api/v3/coins/${id}/ohlc?vs_currency=usd&days=${days}`;
  const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(15_000) });
  if (!res.ok) return null;
  const raw = (await res.json()) as number[][];
  if (!Array.isArray(raw) || raw.length === 0) return null;
  return raw.map((row) => ({
    time: Math.floor(row[0] / 1000),
    open: row[1],
    high: row[2],
    low: row[3],
    close: row[4],
  }));
}

async function tryMindexOhlc(symbol: string, interval: string): Promise<OhlcBar[] | null> {
  const base = mindexApiBase();
  if (!base) return null;
  try {
    const url = `${base}/api/ohlc?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}`;
    const res = await fetch(url, {
      headers: { Accept: "application/json", ...mindexInternalHeaders() },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { bars?: OhlcBar[] };
    if (!data.bars?.length) return null;
    return data.bars;
  } catch {
    return null;
  }
}

/**
 * Fetch OHLC bars for `symbol` and UI `interval` (1m, 5m, …, 1D, 1W).
 */
export async function fetchOhlcSeries(symbol: string, interval: string): Promise<OhlcFetchResult> {
  const sym = symbol.trim().toUpperCase();
  const resFinnhub = INTERVAL_TO_FINNHUB[interval] ?? "D";
  if (!INTERVAL_TO_FINNHUB[interval]) {
    return { bars: [], source: null, error: "unsupported_interval" };
  }

  const mindexBars = await tryMindexOhlc(sym, interval);
  if (mindexBars?.length) {
    return { bars: mindexBars, source: "mindex" };
  }

  const finnhubKey = process.env.FINNHUB_API_KEY?.trim();
  if (finnhubKey) {
    const stockSym = FINNHUB_STOCK[sym];
    if (stockSym) {
      const bars = await fetchFinnhubCandle(finnhubKey, "stock", stockSym, resFinnhub);
      if (bars?.length) return { bars, source: "finnhub_stock" };
    }
    const cryptoSym = FINNHUB_CRYPTO[sym];
    if (cryptoSym) {
      const bars = await fetchFinnhubCandle(finnhubKey, "crypto", cryptoSym, resFinnhub);
      if (bars?.length) return { bars, source: "finnhub_crypto" };
    }
  }

  const cgDays: 1 | 7 | 30 | 90 =
    interval === "1W" ? 90 : interval === "1D" ? 30 : 7;
  if (COINGECKO_IDS[sym] && ["1D", "1W", "60m", "30m", "15m", "5m", "1m"].includes(interval)) {
    const bars = await fetchCoinGeckoOhlc(sym, cgDays);
    if (bars?.length) return { bars, source: "coingecko" };
  }

  return {
    bars: [],
    source: null,
    error: finnhubKey
      ? "no_ohlc_data"
      : "configure_FINNHUB_API_KEY_or_wait_for_MINDEX",
  };
}
