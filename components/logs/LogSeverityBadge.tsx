import type { DashboardLogEvent } from "@/lib/dashboard-logs/types";

type Props = {
  severity: DashboardLogEvent["severity"];
};

const styles: Record<DashboardLogEvent["severity"], string> = {
  debug: "border-slate-400/35 text-slate-200 bg-slate-400/10",
  info: "border-cyan-400/35 text-cyan-200 bg-cyan-400/10",
  success: "border-emerald-400/35 text-emerald-200 bg-emerald-400/10",
  warning: "border-amber-400/35 text-amber-200 bg-amber-400/10",
  error: "border-red-400/35 text-red-200 bg-red-400/10",
};

export function LogSeverityBadge({ severity }: Props) {
  return (
    <span className={`rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${styles[severity]}`}>
      {severity}
    </span>
  );
}
