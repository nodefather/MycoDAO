import { NextRequest, NextResponse } from "next/server";
import { masApiBase, mindexApiBase } from "@/lib/server/pulse-env";

export const dynamic = "force-dynamic";

/** Liveness for probes and smoke tests. Use `?deep=1` to ping MAS/MINDEX when URLs are configured (best-effort). */
export async function GET(req: NextRequest) {
  const deep = req.nextUrl.searchParams.get("deep") === "1";
  const body: Record<string, unknown> = {
    ok: true,
    service: "mycodao-pulse",
    time: new Date().toISOString(),
    node: process.version,
  };

  if (!deep) {
    return NextResponse.json(body);
  }

  const backends: Record<string, { configured: boolean; reachable?: boolean; status?: number }> = {};

  const mas = masApiBase();
  if (mas) {
    try {
      const r = await fetch(`${mas}/health`, { cache: "no-store", signal: AbortSignal.timeout(4000) });
      backends.mas = { configured: true, reachable: r.ok, status: r.status };
    } catch {
      backends.mas = { configured: true, reachable: false };
    }
  } else {
    backends.mas = { configured: false };
  }

  const mindex = mindexApiBase();
  if (mindex) {
    try {
      const r = await fetch(`${mindex}/health`, { cache: "no-store", signal: AbortSignal.timeout(4000) });
      backends.mindex = { configured: true, reachable: r.ok, status: r.status };
    } catch {
      backends.mindex = { configured: true, reachable: false };
    }
  } else {
    backends.mindex = { configured: false };
  }

  return NextResponse.json({ ...body, backends });
}
