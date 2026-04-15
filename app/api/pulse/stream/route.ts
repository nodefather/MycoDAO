import { fetchTickers, peekTickerCacheFresh } from "@/lib/adapters/tickers";
import { pulseSseIntervalMs, pulseStreamBypassCache } from "@/lib/server/pulse-env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Server-Sent Events: ticker snapshots for LAN/fiber-low-latency clients.
 * Per-tick `serverProcessMs` is process time on this host (often under 5ms on cache hit on LAN).
 */
export async function GET(request: Request) {
  const encoder = new TextEncoder();
  const intervalMs = pulseSseIntervalMs();
  const bypass = pulseStreamBypassCache();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      };

      send({
        type: "hello",
        meta: { intervalMs, bypassCache: bypass, ts: Date.now() },
      });

      const tick = async () => {
        if (request.signal.aborted) return;
        try {
          const cacheHitBefore = peekTickerCacheFresh() && !bypass;
          const t0 = process.hrtime.bigint();
          const tickers = await fetchTickers({ bypassCache: bypass });
          const elapsedNs = process.hrtime.bigint() - t0;
          const serverProcessMs = Math.round((Number(elapsedNs) / 1e6) * 1000) / 1000;
          send({
            type: "tickers",
            tickers,
            meta: {
              serverProcessMs,
              cacheHit: cacheHitBefore,
              ts: Date.now(),
            },
          });
        } catch (e) {
          send({ type: "error", message: String(e), ts: Date.now() });
        }
      };

      await tick();
      const id = setInterval(() => {
        void tick();
      }, intervalMs);

      request.signal.addEventListener("abort", () => {
        clearInterval(id);
        try {
          controller.close();
        } catch {
          /* ignore */
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store, no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
