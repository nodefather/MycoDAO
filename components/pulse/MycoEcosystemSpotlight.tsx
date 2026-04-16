"use client";

import Link from "next/link";
import type { MycoSnapshot } from "@/lib/types";

type MycoEcosystemSpotlightProps = {
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

export default function MycoEcosystemSpotlight({ snapshot }: MycoEcosystemSpotlightProps) {
  const summary = snapshot?.canonical?.summary;
  const dist = snapshot?.canonical?.distribution ?? [];

  return (
    <div className="rounded border border-stone-600 bg-stone-900/95 p-1">
      <h3 className="text-xs font-bold uppercase mb-0.5" style={{ color: "var(--accent-gold)" }}>MYCO Ecosystem</h3>
      <p className="text-xs text-stone-400 mb-1">
        {summary ??
          "MYCO is the governance and funding token for the MycoDAO ecosystem. It supports community grants, biobank incentives, and industry partnerships."}
      </p>
      <div className="grid grid-cols-2 gap-1 text-xs text-stone-500 mb-1">
        <span>{supplyLine(snapshot)}</span>
        <span>Chain: {snapshot?.chain ?? "—"}</span>
        {dist.length > 0
          ? dist.slice(0, 6).map((d, i) => (
              <span key={`${d.title}-${i}`}>
                {d.title}: {d.pct}%
              </span>
            ))
          : null}
      </div>
      {snapshot && (
        <div className="flex items-center gap-1 mb-1">
          <span className="font-mono text-xs text-stone-200">${snapshot.price.toFixed(4)}</span>
          <span className={snapshot.changePct >= 0 ? "text-emerald-500" : "text-red-500"}>
            {snapshot.changePct >= 0 ? "+" : ""}{snapshot.changePct.toFixed(2)}%
          </span>
        </div>
      )}
      <Link
        href="/token"
        className="text-xs font-medium hover:opacity-80 transition-opacity"
        style={{ color: "var(--accent-gold)" }}
      >
        Token details →
      </Link>
    </div>
  );
}
