# MyCoDAO

Next.js project. Dev server runs on port 3004.

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3004](http://localhost:3004).

## GitHub

To connect to an existing GitHub repo:

```bash
git remote add origin https://github.com/YOUR_USERNAME/mycodao.git
git add .
git commit -m "Initial commit"
git push -u origin main
```

If the repo is empty, create it on GitHub first, then run the above.

## Scripts

- `npm run dev` — Start dev server (port 3004)
- `npm run build` — Production build
- `npm run start` — Start production server (port 3004)
- `npm run lint` — Run ESLint

## Structure

- `app/` — Next.js App Router (layout, page)
- `components/` — React components
- `lib/` — Utilities and helpers
- `public/` — Static assets
- `content/` — Content (markdown, etc.)
- `docs/` — Project documentation
- `scripts/` — Build and utility scripts
