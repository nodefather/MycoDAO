"use client";

import { usePulse } from "@/lib/pulse-provider";

const MAX_VISIBLE = 5;

export default function StatusModule() {
  const { alerts, dismissAlert, clearAlerts, tradeFeedMeta } = usePulse();
  const visible = alerts.slice(0, MAX_VISIBLE);
  const ms = tradeFeedMeta?.serverProcessMs;
  const feedLabel =
    ms != null
      ? `${tradeFeedMeta?.sseConnected === false ? "SSE … " : ""}${tradeFeedMeta?.cacheHit ? "cache " : ""}${ms.toFixed(1)}ms`
      : null;

  return (
    <div className="space-y-1 leading-snug">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: "var(--accent-green)" }} aria-hidden />
          <span className="text-xs font-medium" style={{ color: "var(--accent-green)" }}>LIVE</span>
        </div>
        {feedLabel ? (
          <span className="text-xs text-stone-500 tabular-nums" title="Server ticker merge time (LAN / fiber)">
            {feedLabel}
          </span>
        ) : null}
      </div>
      {visible.length === 0 ? (
        <div className="text-xs text-stone-500">No alerts</div>
      ) : (
        <>
          <ul className="list-none p-0 m-0 space-y-0.5">
            {visible.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-1 group">
                <span className="text-xs text-stone-400 truncate" title={a.triggeredAt}>
                  {a.message}
                </span>
                <button
                  type="button"
                  onClick={() => dismissAlert(a.id)}
                  className="min-h-[32px] min-w-[32px] text-xs text-stone-500 hover:text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 flex items-center justify-center"
                  aria-label="Dismiss alert"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          {alerts.length > 0 && (
            <button
              type="button"
              onClick={clearAlerts}
              className="text-xs text-stone-500 hover:text-stone-300 mt-1 min-h-[36px]"
            >
              Clear
            </button>
          )}
        </>
      )}
    </div>
  );
}
