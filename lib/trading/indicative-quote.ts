import { fetchTickers } from "@/lib/adapters/tickers";
import type { QuoteIndicative } from "@/lib/trading/types";

export async function indicativeQuoteForSymbol(symbol: string): Promise<QuoteIndicative | null> {
  const sym = symbol.trim().toUpperCase();
  if (!sym) return null;
  const tickers = await fetchTickers();
  const t = tickers.find((x) => x.symbol === sym);
  if (!t) return null;
  return {
    kind: "indicative",
    symbol: t.symbol,
    price: t.price,
    changePct: t.changePct,
    currency: t.currency || "USD",
    asOf: t.updatedAt,
    source: "pulse_tickers",
  };
}
