# MycoDAO

Next.js project. Dev server runs on port 3004.

**Mycosoft:** Canonical remote is [MycosoftLabs/MYCODAO](https://github.com/MycosoftLabs/MYCODAO). Dashboard code merged from [nodefather/MycoDAO](https://github.com/nodefather/MycoDAO) (fork of Abelardo’s repo). Hosting migration, Webflow/Figma, and NatureApp/backend integration notes: `docs/MYCODAO_HOSTING_MIGRATION_AND_NATUREAPP_PREP_APR14_2026.md`.

**Dashboard test + real backends (isolated from mycosoft.com :3010):** `docs/MYCODAO_DASHBOARD_TEST_AND_BACKEND_INTEGRATION_PLAN_APR15_2026.md`.

## Setup

```bash
npm install
npm run dev
```

Production hostname: **pulse.mycodao.com** — deploy: `docs/PULSE_MYCODAO_COM_DEPLOY_AND_TEST_APR14_2026.md`; **Cloudflare Tunnel** (only the `pulse` host; leaves **mycodao.com / www Webflow** unchanged): `docs/PULSE_CLOUDFLARE_TUNNEL_SETUP_APR14_2026.md`. Local: [http://localhost:3004/](http://localhost:3004/) — Pulse dashboard: [http://localhost:3004/pulse](http://localhost:3004/pulse).

## Scripts

- `npm run dev` — Start dev server (port 3004)
- `npm run build` — Production build
- `npm run start` — Start production server (port 3004)
- `npm run lint` — Run ESLint
- `npm run test:pulse-smoke` — API smoke (needs `npm run dev` or `npm run start`)
- `npm run test:pulse-smoke:prod` — Smoke against `https://pulse.mycodao.com` when live

## Structure

- `app/` — Next.js App Router (layout, page)
- `components/` — React components
- `lib/` — Utilities and helpers
- `public/` — Static assets
- `content/` — Content (markdown, etc.)
- `docs/` — Project documentation
- `scripts/` — Build and utility scripts
