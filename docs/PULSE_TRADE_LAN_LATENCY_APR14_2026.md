# Pulse trade latency on Mycosoft LAN — Apr 14, 2026

On the internal 10Gb fiber / `192.168.0.x` network, **1–5ms** is a realistic target for:

- MAS ↔ MINDEX ↔ Pulse API process time  
- Ticker merge when **reading the in-memory cache** (TTL above 0, warm cache)  
- SSE fan-out from the Pulse app server to browsers on the same LAN  

Public upstream APIs (CoinGecko, Finnhub, etc.) add their **own** latency; that is independent of fiber speed. For customer-facing “live” tiers vs internal/agents, push normalized ticks from ingest into MINDEX or a colocated Redis ring on the LAN first, then Pulse reads that path.

**Env (see `.env.example`):** `PULSE_TRADE_FAST_PATH`, `PULSE_TICKER_CACHE_MS`, `PULSE_SSE_INTERVAL_MS`, `NEXT_PUBLIC_PULSE_SSE`, `PULSE_STREAM_BYPASS_CACHE`.
