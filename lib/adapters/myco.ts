/**
 * MYCO snapshot: optional MYCO_SNAPSHOT_URL JSON, DexScreener (Solana mint), or mock when ALLOW_MOCK_FALLBACK.
 */

import type { MycoSnapshot } from "@/lib/types";
import { getMockMycoSnapshot } from "@/lib/mock-data";
import { allowMockFallback } from "@/lib/server/pulse-env";

function ensurePhase3Fields(snapshot: MycoSnapshot): MycoSnapshot {
  const rf = snapshot.researchFunding;
  if (!rf) return snapshot;
  return {
    ...snapshot,
    biobank:
      snapshot.biobank ??
      ({
        samplesIndexed: rf.samplesIndexed,
        labsParticipating: 0,
        dataContributions: Math.floor(rf.samplesIndexed * 0.05),
      } as MycoSnapshot["biobank"]),
    governance:
      snapshot.governance ??
      ({
        activeProposals: rf.activeProposals,
        votingProgressPct: Math.min(100, rf.votesToday > 0 ? 60 + Math.floor(rf.votesToday / 10) : 50),
        grantApprovals: Math.floor((rf.grantsDeployedMyco / (rf.grantPoolMyco || 1)) * 10),
      } as MycoSnapshot["governance"]),
  };
}

function emptySnapshot(): MycoSnapshot {
  const now = new Date().toISOString();
  return {
    price: 0,
    changePct: 0,
    supply: 0,
    chain: "Solana",
    links: {
      tokenPage: process.env.NEXT_PUBLIC_MYCO_TOKEN_PAGE || "/token",
      governanceUrl: process.env.NEXT_PUBLIC_MYCO_GOV_URL,
      buyUrl: process.env.NEXT_PUBLIC_MYCO_BUY_URL,
    },
    updatedAt: now,
    researchFunding: {
      grantPoolMyco: 0,
      grantsDeployedMyco: 0,
      activeProposals: 0,
      votesToday: 0,
      biobankIncentivesMyco: 0,
      activeResearchProjects: 0,
      samplesIndexed: 0,
    },
    biobank: { samplesIndexed: 0, labsParticipating: 0, dataContributions: 0 },
    governance: { activeProposals: 0, votingProgressPct: 0, grantApprovals: 0 },
  };
}

async function fetchDexScreenerToken(mint: string): Promise<{ priceUsd: number; change24h: number } | null> {
  const url = `https://api.dexscreener.com/latest/dex/tokens/${mint}`;
  const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(10_000) });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    pairs?: Array<{ priceUsd?: string; priceChange?: { h24?: number } }>;
  };
  const pair = data.pairs?.[0];
  if (!pair?.priceUsd) return null;
  const priceUsd = parseFloat(pair.priceUsd);
  const change24h = pair.priceChange?.h24 ?? 0;
  if (!Number.isFinite(priceUsd)) return null;
  return { priceUsd, change24h };
}

export async function fetchMycoSnapshot(): Promise<MycoSnapshot> {
  const snapshotUrl = process.env.MYCO_SNAPSHOT_URL?.trim();
  if (snapshotUrl) {
    const res = await fetch(snapshotUrl, { cache: "no-store", signal: AbortSignal.timeout(12_000) });
    if (!res.ok) {
      if (allowMockFallback()) return ensurePhase3Fields(getMockMycoSnapshot());
      return emptySnapshot();
    }
    const raw = (await res.json()) as MycoSnapshot;
    return ensurePhase3Fields(raw);
  }

  const mint = process.env.MYCO_SOLANA_MINT?.trim();
  if (mint) {
    try {
      const dex = await fetchDexScreenerToken(mint);
      if (dex) {
        const now = new Date().toISOString();
        const links: MycoSnapshot["links"] = {
          tokenPage: process.env.NEXT_PUBLIC_MYCO_TOKEN_PAGE || "/token",
          governanceUrl: process.env.NEXT_PUBLIC_MYCO_GOV_URL,
          buyUrl: process.env.NEXT_PUBLIC_MYCO_BUY_URL,
        };
        if (allowMockFallback()) {
          const base = getMockMycoSnapshot();
          const merged: MycoSnapshot = {
            ...base,
            price: dex.priceUsd,
            changePct: dex.change24h,
            updatedAt: now,
            links: { ...base.links, ...links },
          };
          return ensurePhase3Fields(merged);
        }
        return ensurePhase3Fields({
          price: dex.priceUsd,
          changePct: dex.change24h,
          supply: 0,
          chain: "Solana",
          links,
          updatedAt: now,
        });
      }
    } catch {
      /* fall through */
    }
  }

  if (allowMockFallback()) {
    const snapshot = getMockMycoSnapshot();
    return ensurePhase3Fields(snapshot);
  }

  return emptySnapshot();
}
