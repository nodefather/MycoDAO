/**
 * MYCO snapshot: optional MYCO_SNAPSHOT_URL JSON, DexScreener (when MYCO_SOLANA_MINT is set),
 * then enrichment (canonical JSON, treasury, pools, RPC). Mock MYCO data is never used.
 */

import type { MycoSnapshot } from "@/lib/types";
import { enrichMycoSnapshot } from "@/lib/adapters/myco-enrichment";

/**
 * Ensure biobank/governance objects exist for UI shape only.
 * Does not invent metrics from researchFunding (no synthetic DAO/biobank numbers).
 */
function ensurePhase3Fields(snapshot: MycoSnapshot): MycoSnapshot {
  const biobank: MycoSnapshot["biobank"] =
    snapshot.biobank ?? {
      samplesIndexed: 0,
      labsParticipating: 0,
      dataContributions: 0,
    };
  const governance: MycoSnapshot["governance"] =
    snapshot.governance ?? {
      activeProposals: 0,
      votingProgressPct: 0,
      grantApprovals: 0,
    };
  return { ...snapshot, biobank, governance };
}

function emptySnapshot(): MycoSnapshot {
  const now = new Date().toISOString();
  return {
    price: 0,
    changePct: 0,
    supply: 0,
    chain: "Solana",
    links: {
      tokenPage: process.env.NEXT_PUBLIC_MYCO_TOKEN_PAGE || "https://www.mycodao.com/token",
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
      return ensurePhase3Fields(await enrichMycoSnapshot(emptySnapshot()));
    }
    const raw = (await res.json()) as MycoSnapshot;
    return ensurePhase3Fields(await enrichMycoSnapshot(raw));
  }

  const mint = process.env.MYCO_SOLANA_MINT?.trim();
  if (mint) {
    try {
      const dex = await fetchDexScreenerToken(mint);
      if (dex) {
        const now = new Date().toISOString();
        const base = emptySnapshot();
        const links: MycoSnapshot["links"] = {
          ...base.links,
          tokenPage: process.env.NEXT_PUBLIC_MYCO_TOKEN_PAGE || base.links.tokenPage,
          governanceUrl: process.env.NEXT_PUBLIC_MYCO_GOV_URL ?? base.links.governanceUrl,
          buyUrl: process.env.NEXT_PUBLIC_MYCO_BUY_URL ?? base.links.buyUrl,
        };
        const merged: MycoSnapshot = {
          ...base,
          price: dex.priceUsd,
          changePct: dex.change24h,
          updatedAt: now,
          links,
        };
        return ensurePhase3Fields(await enrichMycoSnapshot(merged));
      }
    } catch {
      /* fall through */
    }
  }

  return ensurePhase3Fields(await enrichMycoSnapshot(emptySnapshot()));
}
