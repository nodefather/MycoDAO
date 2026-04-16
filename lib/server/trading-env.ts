/**
 * Server-only env for Pulse trading API (broker proxy + agent auth).
 */

export function tradingBrokerBase(): string {
  return (process.env.TRADING_BROKER_BASE_URL || "").replace(/\/$/, "");
}

export function tradingBrokerToken(): string | undefined {
  return process.env.TRADING_BROKER_TOKEN?.trim() || undefined;
}

/** Agents (and scripts) send this to Pulse `/api/trading/*` when set. */
export function pulseTradingInboundKey(): string | undefined {
  return process.env.PULSE_TRADING_API_KEY?.trim() || undefined;
}

/** When true and `PULSE_TRADING_API_KEY` is unset, same-origin browser POSTs may proxy (LAN/VPN only). */
export function trustSameOriginTrading(): boolean {
  return (
    process.env.PULSE_TRUST_SAME_ORIGIN_TRADING === "true" ||
    process.env.PULSE_TRUST_SAME_ORIGIN_TRADING === "1"
  );
}
