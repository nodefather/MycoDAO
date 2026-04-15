# Figma assets (MycoDAO Master File)

Design file: [MycoDAO Master File](https://www.figma.com/design/zSDD4EXpcwwS4qWWqmuYA1/MycoDAO-Master-File).

## Automated export (API)

1. Create a **Personal access token** at [Figma settings](https://www.figma.com/settings) (scope: read on files you can open).
2. Add to **`.env.local`** (gitignored): `FIGMA_ACCESS_TOKEN=figd_...`
3. From repo root: `npm run figma:export`

Raster exports (PNG @2x) for **components** and **nodes with export settings** land in **`exports/`** with a **`manifest.json`** listing. Default cap: 400 nodes; use `npm run figma:export -- --max-nodes=800` for more.

Manual drops (SVG/PNG from Designer) can still live alongside `exports/`.

Dashboard + marketing alignment: `docs/DASHBOARD_PHASE1_AND_FIGMA_NEXT_PHASE_APR14_2026.md`.
