import { NextResponse } from "next/server";
import { fetchTickers } from "@/lib/adapters/tickers";

export async function GET() {
  try {
    const tickers = await fetchTickers();
    return NextResponse.json(tickers);
  } catch (e) {
    console.error("tickers route:", e);
    return NextResponse.json({ error: "tickers_unavailable", detail: String(e) }, { status: 503 });
  }
}
