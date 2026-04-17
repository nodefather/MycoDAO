import type { LearnTrack } from "@/lib/types";

export const LEARN_TRACK_ORDER: LearnTrack[] = [
  "markets-basics",
  "fungi-mycology",
  "bio-ip",
  "nfts-ordinals",
  "desci",
  "funding-grants",
  "governance",
];

export const LEARN_TRACK_LABELS: Record<LearnTrack, string> = {
  "markets-basics": "Markets",
  "fungi-mycology": "Fungi & mycology",
  "bio-ip": "Bio & IP",
  "nfts-ordinals": "NFTs & Ordinals",
  desci: "DeSci",
  "funding-grants": "Funding & grants",
  governance: "Governance",
};
