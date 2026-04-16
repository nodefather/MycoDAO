import {
  pulseTradingInboundKey,
  trustSameOriginTrading,
} from "@/lib/server/trading-env";

export type AuthFailure = { ok: false; status: number; error: string; detail?: string };
export type AuthOk = { ok: true };
export type TradingAuthResult = AuthOk | AuthFailure;

/**
 * Authorize mutation/read of trading routes.
 * - If `PULSE_TRADING_API_KEY` is set: require `Authorization: Bearer` or `X-Pulse-Trading-Key`.
 * - Else if `PULSE_TRUST_SAME_ORIGIN_TRADING`: allow localhost / mycodao origins (LAN/VPN only).
 * - Else: reject mutations (configure API key or broker-only access).
 */
export function assertTradingAccess(request: Request): TradingAuthResult {
  const required = pulseTradingInboundKey();
  if (required) {
    const auth = request.headers.get("authorization");
    const bearer =
      auth?.startsWith("Bearer ") ? auth.slice(7).trim() : undefined;
    const header = request.headers.get("x-pulse-trading-key")?.trim();
    const got = bearer || header;
    if (got !== required) {
      return {
        ok: false,
        status: 401,
        error: "unauthorized",
        detail: "Set Authorization: Bearer or X-Pulse-Trading-Key to match PULSE_TRADING_API_KEY",
      };
    }
    return { ok: true };
  }

  if (trustSameOriginTrading()) {
    const origin = request.headers.get("origin") ?? "";
    const okOrigin =
      origin.startsWith("http://localhost:") ||
      origin.startsWith("http://127.0.0.1:") ||
      /mycodao\.(com|financial)/i.test(origin);
    if (okOrigin) return { ok: true };
    return {
      ok: false,
      status: 403,
      error: "forbidden_origin",
      detail: "PULSE_TRUST_SAME_ORIGIN_TRADING allows only localhost and mycodao hosts",
    };
  }

  return {
    ok: false,
    status: 503,
    error: "trading_auth_not_configured",
    detail:
      "Set PULSE_TRADING_API_KEY for agents, or PULSE_TRUST_SAME_ORIGIN_TRADING=1 for trusted same-origin UI (LAN only)",
  };
}
