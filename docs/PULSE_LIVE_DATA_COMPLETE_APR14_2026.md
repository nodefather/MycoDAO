# Pulse live data integration — complete (Apr 14, 2026)

**Status:** Complete  
**Related:** Pulse live data sources plan (MYCODAO), `docs/MYCODAO_DASHBOARD_TEST_AND_BACKEND_INTEGRATION_PLAN_APR15_2026.md`

## Delivered

- **Env / health:** `lib/server/pulse-env.ts`, `.env.example` (incl. `ALLOW_MOCK_FALLBACK`, MINDEX token, market/news/calendar/podcast/learn URLs), `npm run check:backends` → `scripts/check-pulse-backends.mjs`.
- **MYCO:** `lib/adapters/myco.ts` — `MYCO_SNAPSHOT_URL`, DexScreener + `MYCO_SOLANA_MINT`, empty snapshot when no mock.
- **Research:** `lib/adapters/research.ts` + `app/api/research` — MINDEX internal `/api/mindex/research`, else OpenAlex, else mock only if allowed.
- **Tickers:** `lib/adapters/tickers.ts` — expanded CoinGecko IDs, optional Finnhub, DexScreener for MYCO row.
- **News:** `lib/adapters/news.ts` — GNews/NewsAPI or empty / mock per policy.
- **Podcasts / learn:** `lib/adapters/podcasts.ts` (rss-parser + `PODCAST_RSS_URLS`), `lib/adapters/learn.ts` + `data/learn-modules.json`.
- **Calendar:** `lib/adapters/calendar.ts`, `app/api/calendar/route.ts`, `PulseProvider` + `normalizeAllEvents` consume `upcomingCatalysts`; `CalendarEventsModule` uses context.
- **UI:** `components/pulse/PulseInsightsModule.tsx` (movers, headlines, unified event snippet); wired in `DashboardMode1`.
- **Policy:** API routes return JSON errors (503) instead of silent mock catches; adapters respect `ALLOW_MOCK_FALLBACK`.

## Verify

- `npm run build` (MYCODAO root).
- `npm run check:backends` with `MAS_API_URL` / `MINDEX_API_URL` / `NATUREOS_API_URL` in `.env.local`.
- Local: `npm run dev` on port 3004; network tab: `/api/*` payloads match configured backends.
