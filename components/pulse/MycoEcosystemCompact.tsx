"use client";

import Link from "next/link";
import type { MycoSnapshot } from "@/lib/types";

type MycoEcosystemCompactProps = {
  snapshot: MycoSnapshot | null;
};

function supplyLine(snapshot: MycoSnapshot | null): string {
  if (!snapshot) return "Supply: —";
  const c = snapshot.canonical;
  if (c?.totalSupplyLabel) return `Supply: ${c.totalSupplyLabel}`;
  if (snapshot.supply > 0) {
    const n = snapshot.supply;
    if (n >= 1_000_000) return `Supply: ${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 2)}M`;
    return `Supply: ${n.toLocaleString()}`;
  }
  return "Supply: —";
}

export default function MycoEcosystemCompact({ snapshot }: MycoEcosystemCompactProps) {
  const dist = snapshot?.canonical?.distribution;
  const row1 = dist?.[0];
  const row2 = dist?.[1];

  return (
    <div className="space-y-0">
      {snapshot && (
        <div className="flex items-center justify-between py-[1px] border-b border-neutral-800 leading-tight">
          <span className="font-mono text-xs tabular-nums text-stone-200">${snapshot.price.toFixed(4)}</span>
          <span className={`font-mono text-xs tabular-nums ${snapshot.changePct >= 0 ? "text-emerald-500" : "text-red-500"}`}>
            {snapshot.changePct >= 0 ? "▲" : "▼"} {snapshot.changePct >= 0 ? "+" : ""}{snapshot.changePct.toFixed(2)}%
          </span>
        </div>
      )}
      <div className="grid grid-cols-2 gap-x-2 gap-y-0 text-xs text-stone-500">
        <span>{supplyLine(snapshot)}</span>
        <span>Chain: {snapshot?.chain ?? "—"}</span>
        <span>{row1 ? `${row1.title}: ${row1.pct}%` : "Allocation: —"}</span>
        <span>{row2 ? `${row2.title}: ${row2.pct}%` : "—"}</span>
      </div>
      <Link href="/token" className="block text-xs hover:opacity-80 transition-opacity shrink-0" style={{ color: "var(--accent-gold)" }}>
        Token details →
      </Link>
    </div>
  );
}
