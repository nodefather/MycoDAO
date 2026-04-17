import { NextRequest, NextResponse } from "next/server";
import { masApiBase, verifyPulseInternalKey } from "@/lib/server/pulse-env";

export const dynamic = "force-dynamic";

const SUBMIT_PATH = "/api/tasks/submit";

/**
 * Proxy MAS task intake from Pulse (server-side). POST body is forwarded to MAS TaskSubmission JSON.
 *
 * Auth: send header `x-pulse-internal-key` matching `PULSE_MAS_PROXY_SECRET`, or set
 * `PULSE_ALLOW_OPEN_MAS_PROXY=1` only on trusted dev/LAN (never public production).
 *
 * GET: capability summary (no secrets).
 */
export async function GET() {
  const mas = masApiBase();
  return NextResponse.json({
    service: "pulse-mas-task-proxy",
    mas_configured: Boolean(mas),
    mas_submit_url_hint: mas ? `${mas}${SUBMIT_PATH}` : null,
    auth:
      "POST with x-pulse-internal-key matching PULSE_MAS_PROXY_SECRET, or PULSE_ALLOW_OPEN_MAS_PROXY=1 (dev only)",
    mas_task_schema: {
      description: "string (required)",
      task_type: "string (optional)",
      target_agent: "string (optional)",
      priority: "number (optional)",
      payload: "object (optional)",
      source: "string (optional, e.g. pulse)",
    },
  });
}

export async function POST(req: NextRequest) {
  if (!verifyPulseInternalKey(req.headers.get("x-pulse-internal-key"))) {
    return NextResponse.json(
      {
        error: "unauthorized",
        hint: "Set PULSE_MAS_PROXY_SECRET and send header x-pulse-internal-key, or use PULSE_ALLOW_OPEN_MAS_PROXY=1 on dev LAN only",
      },
      { status: 401 }
    );
  }

  const mas = masApiBase();
  if (!mas) {
    return NextResponse.json({ error: "mas_not_configured", hint: "Set MAS_API_URL" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const url = `${mas}${SUBMIT_PATH}`;
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60_000),
      cache: "no-store",
    });
    const text = await r.text();
    const ct = r.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) {
      try {
        return NextResponse.json(JSON.parse(text), { status: r.status });
      } catch {
        return NextResponse.json({ error: "mas_bad_json", raw: text.slice(0, 500) }, { status: 502 });
      }
    }
    return new NextResponse(text, { status: r.status });
  } catch (e) {
    console.error("pulse mas-task proxy", e);
    return NextResponse.json({ error: "mas_unreachable" }, { status: 502 });
  }
}
