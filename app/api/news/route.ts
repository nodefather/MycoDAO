import { NextResponse } from "next/server";
import { fetchNews } from "@/lib/adapters/news";

export async function GET() {
  try {
    const news = await fetchNews();
    return NextResponse.json(news);
  } catch (e) {
    console.error("news route:", e);
    return NextResponse.json({ error: "news_unavailable", detail: String(e) }, { status: 503 });
  }
}
