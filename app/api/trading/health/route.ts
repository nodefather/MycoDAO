import { NextResponse } from "next/server";
import {
  pulseTradingInboundKey,
  tradingBrokerBase,
  trustSameOriginTrading,
} from "@/lib/server/trading-env";
import type { TradingHealth } from "@/lib/trading/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const brokerConfigured = Boolean(tradingBrokerBase());
  const key = pulseTradingInboundKey();
  const inboundAuth: TradingHealth["inboundAuth"] = key
    ? "api_key"
    : trustSameOriginTrading()
      ? "same_origin"
      : "unconfigured";

  const body: TradingHealth = {
    brokerConfigured,
    brokerBaseUrl: brokerConfigured ? tradingBrokerBase() : null,
    inboundAuth,
    timestamp: new Date().toISOString(),
  };
  return NextResponse.json(body);
}
