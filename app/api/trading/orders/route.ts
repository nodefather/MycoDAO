import { NextRequest, NextResponse } from "next/server";
import { brokerFetch } from "@/lib/trading/broker-proxy";
import { tradingBrokerBase } from "@/lib/server/trading-env";
import { assertTradingAccess } from "@/lib/trading/trading-auth";

export const dynamic = "force-dynamic";

/**
 * Proxies to broker `GET/POST /v1/orders`. Requires trading auth.
 * When broker is unset: returns 503 with configuration hints (no mock orders).
 */
export async function GET(req: NextRequest) {
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
        detail:
          "Set TRADING_BROKER_BASE_URL to your execution service (MAS/CCXT/Jupiter bridge)",
        orders: [],
      },
      { status: 503 }
    );
  }

  const q = req.nextUrl.searchParams.toString();
  const path = q ? `/v1/orders?${q}` : "/v1/orders";
  const res = await brokerFetch(path, { method: "GET" });
  if (!res) {
    return NextResponse.json({ error: "broker_unavailable" }, { status: 503 });
  }
  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json" },
  });
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
        detail:
          "Set TRADING_BROKER_BASE_URL and implement POST /v1/orders on your broker service",
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

  const res = await brokerFetch("/v1/orders", {
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
