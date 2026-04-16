/**
 * Trading terminal ↔ broker contract (DEX/CEX adapters live behind TRADING_BROKER_URL).
 */

export type Venue = "dex" | "cex" | "simulation";

export type OrderSide = "buy" | "sell";

export type OrderType = "market" | "limit";

export type QuoteIndicative = {
  kind: "indicative";
  symbol: string;
  price: number;
  changePct?: number;
  currency: string;
  asOf: string;
  source: string;
};

export type QuoteFromBroker = {
  kind: "broker";
  symbol: string;
  raw: Record<string, unknown>;
};

export type PlaceOrderRequest = {
  symbol: string;
  side: OrderSide;
  type: OrderType;
  /** Base asset quantity (crypto) or shares; broker interprets. */
  quantity: number;
  limitPrice?: number;
  venue?: Venue;
  /** Optional idempotency for agents */
  clientOrderId?: string;
};

export type OrderRecord = {
  id: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  status: string;
  quantity: number;
  filledQty?: number;
  avgPrice?: number;
  createdAt: string;
  venue?: Venue;
  raw?: Record<string, unknown>;
};

export type TradingHealth = {
  brokerConfigured: boolean;
  brokerBaseUrl: string | null;
  inboundAuth: "api_key" | "same_origin" | "unconfigured";
  timestamp: string;
};
