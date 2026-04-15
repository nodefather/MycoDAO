import { NextResponse } from "next/server";
import { fetchMycoSnapshot } from "@/lib/adapters/myco";

export async function GET() {
  try {
    const snapshot = await fetchMycoSnapshot();
    return NextResponse.json(snapshot);
  } catch (e) {
    console.error("myco route:", e);
    return NextResponse.json({ error: "myco_unavailable", detail: String(e) }, { status: 503 });
  }
}
