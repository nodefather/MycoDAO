# MyCoDAO — Project Setup

**Date:** 2026-02-15

## Summary

Created new Next.js project `mycodao` on port 3004.

## Structure

| Path | Purpose |
|------|---------|
| `app/` | Next.js App Router — layout.js, page.js, globals.css |
| `components/` | React components |
| `lib/` | Utilities and helpers |
| `public/` | Static assets |
| `content/` | Content (markdown, etc.) |
| `docs/` | Project documentation |
| `scripts/` | Build and utility scripts |

## Config

- **Port:** 3004 (dev and start)
- **Stack:** Next.js 14, React 18, Tailwind CSS
- **Git:** Initialized; add remote for GitHub

## Connect to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/mycodao.git
git add .
git commit -m "Initial commit"
git push -u origin main
```
