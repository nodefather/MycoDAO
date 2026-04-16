import { NextResponse } from "next/server";
import { DEFAULT_TRADING_SYMBOLS } from "@/lib/trading/default-symbols";

export const dynamic = "force-dynamic";

/** Tradable / chartable symbols for the terminal UI (expand via broker later). */
export async function GET() {
  return NextResponse.json({
    symbols: [...DEFAULT_TRADING_SYMBOLS],
    source: "pulse_defaults",
  });
}
