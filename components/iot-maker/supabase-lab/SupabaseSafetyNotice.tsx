"use client";

type SupabaseSafetyNoticeProps = {
  showRawSql?: boolean;
};

export function SupabaseSafetyNotice({ showRawSql = false }: SupabaseSafetyNoticeProps) {
  return (
    <div className="rounded border border-amber-400/40 bg-black/40 p-3 text-xs">
      <p className="mb-1 font-semibold uppercase tracking-[0.16em] text-amber-300">Read-only safety policy</p>
      <ul className="space-y-1 text-slate-200">
        <li>• Preset queries are read-only and whitelisted by design.</li>
        <li>• Dangerous SQL keywords are blocked, including INSERT/UPDATE/DELETE/DROP/etc.</li>
        <li>• No raw telemetry or command data is written from this lab.</li>
        {showRawSql ? (
          <li>• Raw SQL is intentionally blocked unless explicitly enabled by server flag.</li>
        ) : null}
      </ul>
      <p className="mt-2 text-[11px] text-command-muted">
        All failed or blocked query attempts are recorded in Dashboard Logs.
      </p>
    </div>
  );
}
