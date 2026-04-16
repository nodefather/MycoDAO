import { NextResponse } from "next/server";
import { appendPodcastChat, readPodcastChat } from "@/lib/server/podcast-chat-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const messages = readPodcastChat().slice(-150);
  return NextResponse.json({ messages });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { text?: string; displayName?: string };
    const text = typeof body.text === "string" ? body.text : "";
    if (!text.trim()) {
      return NextResponse.json({ error: "empty_message" }, { status: 400 });
    }
    const msg = appendPodcastChat({
      text,
      displayName: typeof body.displayName === "string" ? body.displayName : undefined,
    });
    return NextResponse.json({ ok: true, message: msg });
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
}
