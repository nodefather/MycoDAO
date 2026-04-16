import { NextRequest, NextResponse } from "next/server";
import { brokerFetch } from "@/lib/trading/broker-proxy";
import { tradingBrokerBase } from "@/lib/server/trading-env";
import { assertTradingAccess } from "@/lib/trading/trading-auth";

export const dynamic = "force-dynamic";

/** Proxy `GET /v1/positions` on the broker service. */
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
        detail: "Set TRADING_BROKER_BASE_URL",
        positions: [],
      },
      { status: 503 }
    );
  }

  const q = req.nextUrl.searchParams.toString();
  const path = q ? `/v1/positions?${q}` : "/v1/positions";
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
