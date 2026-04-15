import { NextResponse } from "next/server";
import { fetchResearchItems } from "@/lib/adapters/research";

export async function GET() {
  try {
    const data = await fetchResearchItems();
    return NextResponse.json(data);
  } catch (e) {
    console.error("research route:", e);
    return NextResponse.json({ error: "research_unavailable", detail: String(e) }, { status: 503 });
  }
}
