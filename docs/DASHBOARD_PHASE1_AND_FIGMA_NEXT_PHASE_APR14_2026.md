# Dashboard Phase 1 & Figma parity for Next rebuild — Apr 14, 2026

**Priority now:** Ship and extend the **Next.js dashboard** in this repo (`/pulse`, modes 1–3, APIs under `app/api/`).  
**Later:** Rebuild **mycodao.com** marketing in Next with **the same Figma file** ([MycoDAO Master File](https://www.figma.com/design/zSDD4EXpcwwS4qWWqmuYA1/MycoDAO-Master-File)) so visuals stay aligned.

---

## Phase 1 — work on the dashboard (this repo)

| Area | Location | Notes |
|------|----------|--------|
| **Pulse UI** | `app/pulse/`, `components/pulse/` | Three modes (`DashboardMode1`–`3`), bottom tickers, modules (news, research, movers, etc.). |
| **Shell / layout** | `app/pulse/layout.tsx` | Fixed viewport, black border frame, `DashboardModeProvider`. |
| **Data layer** | `lib/pulse-provider.tsx`, `lib/types.ts` | Tickers, news, podcasts, learn, research, MYCO snapshot; intelligence + events. |
| **API routes** | `app/api/*` | `tickers`, `news`, `podcasts`, `learn`, `research`, `myco` — replace or proxy to MAS / MINDEX / NatureOS as you integrate. |
| **Styling** | `app/globals.css`, `tailwind.config.js` | Today: stone palette + `--accent-green` / `--accent-gold`. Extend here when you align tokens to Figma. |
| **Local dev** | Port **3004** | `npm install` → `npm run dev` → [http://localhost:3004/pulse](http://localhost:3004/pulse) |

**Suggested first tasks (engineering)**

1. Wire `.env.local` from `.env.example` (news keys optional; add MAS/MINDEX/NatureOS when ready).
2. Pick one **API route** (e.g. `myco`) and proxy to real MINDEX/MYCODAO backend — prove end-to-end.
3. Rename/copy for **NatureApp** / DAO product language in headers and modules (incremental).
4. Keep **MYCO on Solana** and reward flows as product decisions; wallet UI can follow API readiness.

---

## Phase 2 — Next rebuild of mycodao.com with Figma aesthetics

**Goal:** New Next app (or new routes in this monorepo) that **matches Webflow + Figma**, not a different brand.

| Step | Action |
|------|--------|
| 1 | Export **icons, illustrations, logos** from Figma → `public/assets/figma/` (SVG preferred; PNG @2x where needed). |
| 2 | Record **typography** (families, weights, sizes) and **color hex** from Figma → map to `tailwind.config.js` `theme.extend` and/or CSS variables in `globals.css`. |
| 3 | **Spacing / radius / grid** — match Figma layout specs; use shared tokens so Pulse dashboard can reuse the same tokens later. |
| 4 | Rebuild pages as **App Router** routes; no mock business data — connect to real APIs when live. |
| 5 | Optional: **Webflow DevLink** only if you want ongoing Designer sync; otherwise Figma + Next is the source of truth. |

**Single design source:** Treat the **Figma master file** as canonical for “looks like mycodao.com”; Webflow is reference until cut over.

---

## Contract with Mycosoft backends

Dashboard and future marketing pages should call **MYCA / MINDEX / NatureOS** via **environment variables** (see `.env.example`), not hardcoded IPs — same pattern as mycosoft.com.

---

## References

- Figma: [MycoDAO Master File (dev)](https://www.figma.com/design/zSDD4EXpcwwS4qWWqmuYA1/MycoDAO-Master-File?node-id=210-33415&m=dev)
- Prep / DAO vs contractor: `MYCODAO_HOSTING_MIGRATION_AND_NATUREAPP_PREP_APR14_2026.md`
