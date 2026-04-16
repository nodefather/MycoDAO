import { tradingBrokerBase, tradingBrokerToken } from "@/lib/server/trading-env";

function headers(init?: HeadersInit): Headers {
  const h = new Headers(init);
  const t = tradingBrokerToken();
  if (t && !h.has("Authorization")) h.set("Authorization", `Bearer ${t}`);
  h.set("Accept", "application/json");
  return h;
}

/**
 * Forward request to external broker / execution service (MAS, CCXT bridge, Jupiter, etc.).
 */
export async function brokerFetch(
  path: string,
  init?: RequestInit
): Promise<Response | null> {
  const base = tradingBrokerBase();
  if (!base) return null;
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  return fetch(url, {
    ...init,
    headers: headers(init?.headers),
    signal: init?.signal ?? AbortSignal.timeout(30_000),
  });
}
