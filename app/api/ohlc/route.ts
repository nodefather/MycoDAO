import { NextRequest, NextResponse } from "next/server";
import { fetchOhlcSeries } from "@/lib/adapters/ohlc";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol")?.trim() ?? "BTC";
  const interval = req.nextUrl.searchParams.get("interval")?.trim() ?? "1D";

  try {
    const { bars, source, error } = await fetchOhlcSeries(symbol, interval);
    return NextResponse.json({
      symbol: symbol.toUpperCase(),
      interval,
      bars,
      source,
      error: error ?? null,
      count: bars.length,
    });
  } catch (e) {
    console.error("ohlc route:", e);
    return NextResponse.json(
      { error: "ohlc_failed", detail: String(e), bars: [] },
      { status: 503 }
    );
  }
}
