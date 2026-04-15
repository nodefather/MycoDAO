import { NextResponse } from "next/server";
import { fetchPodcastEpisodes } from "@/lib/adapters/podcasts";

export async function GET() {
  try {
    const podcasts = await fetchPodcastEpisodes();
    return NextResponse.json(podcasts);
  } catch (e) {
    console.error("podcasts route:", e);
    return NextResponse.json({ error: "podcasts_unavailable", detail: String(e) }, { status: 503 });
  }
}
