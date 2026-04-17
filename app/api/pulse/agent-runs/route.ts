import { NextRequest, NextResponse } from "next/server";
import { verifyPulseInternalKey } from "@/lib/server/pulse-env";
import { getSupabaseServiceRole } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Recent rows from pulse_agent_runs (if Supabase + migration applied).
 * Protected: same `x-pulse-internal-key` as /api/pulse/mas-task.
 */
export async function GET(req: NextRequest) {
  if (!verifyPulseInternalKey(req.headers.get("x-pulse-internal-key"))) {
    return NextResponse.json(
      { error: "unauthorized", hint: "x-pulse-internal-key or PULSE_ALLOW_OPEN_MAS_PROXY (dev)" },
      { status: 401 }
    );
  }

  const sb = getSupabaseServiceRole();
  if (!sb) {
    return NextResponse.json({
      ok: false,
      supabase_configured: false,
      hint: "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY; apply supabase/migrations/001_mycodao_pulse_agent_runs.sql",
    });
  }

  const limit = Math.min(100, Math.max(1, parseInt(req.nextUrl.searchParams.get("limit") ?? "50", 10) || 50));
  const { data, error } = await sb
    .from("pulse_agent_runs")
    .select("id, created_at, task_id, description, source, status, priority")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("pulse_agent_runs", error);
    return NextResponse.json(
      { ok: false, error: error.message, hint: "Table missing? Run migration 001_mycodao_pulse_agent_runs.sql" },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: true, supabase_configured: true, runs: data ?? [], count: data?.length ?? 0 });
}
