"use client";

import type { ReadinessCheck } from "@/lib/iot-maker/types";

type Props = {
  check: ReadinessCheck;
};

function statusClass(status: ReadinessCheck["status"]) {
  switch (status) {
    case "ready":
      return "border-emerald-300/40 bg-emerald-300/10 text-emerald-100";
    case "simulated":
    case "warning":
      return "border-cyan-300/40 bg-cyan-300/10 text-cyan-100";
    case "blocked":
    case "error":
      return "border-red-300/45 bg-red-300/12 text-red-100";
    default:
      return "border-command-line bg-black/40 text-command-muted";
  }
}

export function ServiceReadinessCard({ check }: Props) {
  return (
    <article className={`border p-3 ${statusClass(check.status)}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.12em]">{check.label}</p>
        <span className="text-[10px] font-mono uppercase">{check.status}</span>
      </div>
      <p className="mt-1 text-xs text-slate-200">{check.safeMessage}</p>
      <p className="mt-2 text-[10px] font-mono text-command-muted">
        required for demo: {check.requiredForDemo ? "yes" : "no"} / required for connected:{" "}
        {check.requiredForConnected ? "yes" : "no"}
      </p>
    </article>
  );
}
