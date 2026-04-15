import { NextResponse } from "next/server";
import { fetchLearnModules } from "@/lib/adapters/learn";

export async function GET() {
  try {
    const modules = await fetchLearnModules();
    return NextResponse.json(modules);
  } catch (e) {
    console.error("learn route:", e);
    return NextResponse.json({ error: "learn_unavailable", detail: String(e) }, { status: 503 });
  }
}
