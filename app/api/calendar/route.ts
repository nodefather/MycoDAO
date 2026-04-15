import { NextResponse } from "next/server";
import { fetchUpcomingCatalysts } from "@/lib/adapters/calendar";

export async function GET() {
  try {
    const rows = await fetchUpcomingCatalysts();
    return NextResponse.json(rows);
  } catch (e) {
    console.error("calendar route:", e);
    return NextResponse.json({ error: "calendar_unavailable", detail: String(e) }, { status: 503 });
  }
}
