export type Ticker = {
  id: string;
  symbol: string;
  name: string;
  assetClass: "crypto" | "equity" | "commodity" | "forex" | "precious_metals" | "bio";
  currency: string;
  price: number;
  change: number;
  changePct: number;
  /** 1h or session change % for Big Movers */
  sessionChangePct?: number;
  sparkline: number[];
  updatedAt: string;
};

export type CatalystType =
  | "earnings"
  | "macro"
  | "regulation"
  | "network activity"
  | "proposal"
  | "partnership"
  | "research funding"
  | "grant"
  | "biobank milestone"
  | "market sentiment";

export type ImpactLevel = "high" | "medium" | "low";

export type NewsItem = {
  id: string;
  source: string;
  title: string;
  summary: string;
  url: string;
  image?: string;
  tags: string[];
  publishedAt: string;
  category: "markets" | "crypto" | "mycodao";
  /** Optional: assets/symbols this news affects (API or upstream). */
  relatedAssets?: string[];
  /** Optional: type of catalyst (API or upstream). */
  catalystType?: CatalystType;
  /** Optional: market impact (API or upstream). */
  impactLevel?: ImpactLevel;
};

/** RSS / enclosure derived: video (YouTube, mp4, live) vs audio-only. */
export type PodcastMediaKind = "audio" | "video";

export type PodcastEpisode = {
  id: string;
  title: string;
  show: string;
  description: string;
  /** Primary media URL: mp3/m4a for audio, or mp4/m3u8/direct video file for VOD when no embed. */
  audioUrl: string;
  mediaKind: PodcastMediaKind;
  /** iframe embed (YouTube/Vimeo/live stream) when present. */
  embedUrl?: string;
  image?: string;
  durationSec: number;
  publishedAt: string;
};

/** Curriculum grouping for Pulse Learn filters and badges. */
export type LearnTrack =
  | "markets-basics"
  | "fungi-mycology"
  | "bio-ip"
  | "nfts-ordinals"
  | "desci"
  | "funding-grants"
  | "governance";

export type LearnResourceLink = {
  label: string;
  href: string;
};

export type LearnModule = {
  id: string;
  title: string;
  level: "beginner" | "intermediate" | "advanced";
  readingTimeMin: number;
  summary: string;
  tags: string[];
  contentMd: string;
  /** Primary curriculum track (defaults to markets-basics if omitted in legacy data). */
  track?: LearnTrack;
  /** External references — documentation, standards, neutral primers (not endorsements). */
  resourceLinks?: LearnResourceLink[];
};

export type ResearchFundingMetrics = {
  grantPoolMyco: number;
  grantsDeployedMyco: number;
  activeProposals: number;
  votesToday: number;
  biobankIncentivesMyco: number;
  activeResearchProjects: number;
  samplesIndexed: number;
};

export type BiobankActivity = {
  samplesIndexed: number;
  labsParticipating: number;
  dataContributions: number;
};

export type DaoGovernance = {
  activeProposals: number;
  votingProgressPct: number;
  grantApprovals: number;
};

/** DEX liquidity pool (e.g. DexScreener) for MYCO. */
export type MycoDexPool = {
  chainId?: string;
  dexId: string;
  pairAddress: string;
  baseToken: string;
  quoteToken: string;
  liquidityUsd?: number;
  volumeH24?: number;
  priceUsd?: number;
  /** 24h % from DexScreener pair, when present */
  priceChangeH24?: number;
  url?: string;
};

/** CoinMarketCap quote when `COINMARKETCAP_API_KEY` + `MYCO_CMC_ID` are configured. */
export type MycoCoinmarketcap = {
  cmcRank?: number;
  marketCapUsd?: number;
  volume24hUsd?: number;
  percentChange24h?: number;
  circulatingSupply?: number;
  lastUpdated?: string;
  url?: string;
};

/** Solana mint + explorer links; optional on-chain supply via RPC. */
export type MycoSolanaOnchain = {
  mint: string;
  rawSupply?: string;
  decimals?: number;
  tokenExplorerUrl: string;
  mintExplorerUrl: string;
};

/** Internal DAO treasury pool / vault (addresses from `data/myco-dao-treasury.json` or env). */
export type MycoDaoPool = {
  id: string;
  label: string;
  address: string;
  purpose?: string;
  balanceMyco?: number;
  explorerUrl?: string;
};

/** Budget line for MYCO funding uses (grants, liquidity, ops). */
export type MycoFundingUse = {
  id: string;
  category: string;
  description: string;
  allocationPct?: number;
  committedMyco?: number;
};

export type MycoTreasury = {
  pools: MycoDaoPool[];
  fundingUses: MycoFundingUse[];
};

/** Static facts & copy aligned with the public token page (see `data/myco-token-canonical.json`). */
export type MycoTokenCanonical = {
  sourceUrl: string;
  /** ISO date when Pulse copy was last checked against the public page */
  lastContentSync?: string;
  headline: string;
  summary: string;
  totalSupplyAmount: number;
  totalSupplyLabel: string;
  networks: { key: string; title: string; description: string }[];
  distribution: { pct: number; title: string; description: string }[];
  utilities: { order: number; title: string; description: string }[];
  /** Solana Realms — on-chain proposals and MYCO-weighted voting */
  realmsDaoUrl?: string;
  externalLinks: { label: string; href: string }[];
};

export type MycoSnapshot = {
  price: number;
  changePct: number;
  supply: number;
  chain: string;
  links: {
    tokenPage: string;
    governanceUrl?: string;
    buyUrl?: string;
  };
  updatedAt: string;
  researchFunding?: ResearchFundingMetrics;
  biobank?: BiobankActivity;
  governance?: DaoGovernance;
  /** All known DEX pairs from DexScreener (MYCO_SOLANA_MINT). */
  dexPools?: MycoDexPool[];
  coinmarketcap?: MycoCoinmarketcap;
  solana?: MycoSolanaOnchain;
  /** DAO pools, vaults, and funding allocation lines (config-driven). */
  treasury?: MycoTreasury;
  /** Canonical tokenomics & utilities from mycodao.com/token */
  canonical?: MycoTokenCanonical;
};

export type ResearchItem = {
  id: string;
  title: string;
  source: string;
  summary: string;
  category: "ecosystem" | "funding" | "biobank" | "science";
  publishedAt: string;
};
