/**
 * Dev-only minimal curriculum when `LEARN_DEV_FALLBACK=1` and no `data/learn-modules.json` / remote URL.
 * Not used in production unless that env is set. Shapes must match `LearnModule` in `lib/types.ts`.
 */
import type { LearnModule } from "@/lib/types";

export function getMockLearnModules(): LearnModule[] {
  return [
    {
      id: "dev-markets-ticker",
      title: "What is a Ticker? (dev sample)",
      level: "beginner",
      track: "markets-basics",
      readingTimeMin: 2,
      summary: "Fallback lesson when LEARN_DEV_FALLBACK is on and no curriculum file is present.",
      tags: ["basics", "dev"],
      resourceLinks: [{ label: "Investor.gov — tickers", href: "https://www.investor.gov/introduction-investing/investing-basics/how-stock-markets-work" }],
      contentMd:
        "# Dev fallback\n\nThis card appears only when **`LEARN_DEV_FALLBACK=1`** and **`data/learn-modules.json`** is missing or invalid. Add real curriculum to `data/learn-modules.json` for production.",
    },
    {
      id: "dev-desci-intro",
      title: "DeSci overview (dev sample)",
      level: "beginner",
      track: "desci",
      readingTimeMin: 3,
      summary: "Placeholder for decentralized science context in development builds.",
      tags: ["desci", "dev"],
      resourceLinks: [{ label: "Nature — reproducibility", href: "https://www.nature.com/nature-index/news/why-science-needs-more-research-on-research" }],
      contentMd:
        "# DeSci (dev)\n\nUse **`data/learn-modules.json`** for full modules. Disable fallback by removing **`LEARN_DEV_FALLBACK`** from `.env.local`.",
    },
  ];
}
