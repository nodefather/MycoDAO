import { NextRequest, NextResponse } from "next/server";
import { brokerFetch } from "@/lib/trading/broker-proxy";
import { tradingBrokerBase } from "@/lib/server/trading-env";
import { assertTradingAccess } from "@/lib/trading/trading-auth";
import { indicativeQuoteForSymbol } from "@/lib/trading/indicative-quote";

export const dynamic = "force-dynamic";

/**
 * GET ?symbol=BTC — public indicative quote from Pulse tickers (no execution).
 * POST — proxy to broker `/v1/quote` when `TRADING_BROKER_BASE_URL` is set (auth required).
 */
export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol")?.trim() ?? "";
  if (!symbol) {
    return NextResponse.json({ error: "missing_symbol" }, { status: 400 });
  }
  const q = await indicativeQuoteForSymbol(symbol);
  if (!q) {
    return NextResponse.json(
      { error: "symbol_not_found", symbol: symbol.toUpperCase() },
      { status: 404 }
    );
  }
  return NextResponse.json(q);
}

export async function POST(req: NextRequest) {
  const auth = assertTradingAccess(req);
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.error, detail: auth.detail },
      { status: auth.status }
    );
  }

  if (!tradingBrokerBase()) {
    return NextResponse.json(
      {
        error: "broker_not_configured",
        detail: "Set TRADING_BROKER_BASE_URL for executable quotes",
      },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const res = await brokerFetch("/v1/quote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res) {
    return NextResponse.json({ error: "broker_unavailable" }, { status: 503 });
  }

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json" },
  });
}
