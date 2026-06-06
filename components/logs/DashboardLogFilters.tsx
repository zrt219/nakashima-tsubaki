"use client";

import type { DashboardLogFilter, DashboardLogMode, DashboardLogSeverity, DashboardLogSource } from "@/lib/dashboard-logs/types";

type Props = {
  filters: DashboardLogFilter;
  onChange: (next: DashboardLogFilter) => void;
};

const sources: Array<DashboardLogSource | "all"> = [
  "all",
  "iot_maker",
  "supabase",
  "gemini",
  "aws_iot",
  "proof_ledger",
  "operator_gate",
  "simulator",
  "system",
];

const severities: Array<DashboardLogSeverity | "all"> = [
  "all",
  "debug",
  "info",
  "success",
  "warning",
  "error",
];

const modes: Array<DashboardLogMode | "all"> = ["all", "mock", "demo", "connected", "partial", "blocked"];

export function DashboardLogFilters({ filters, onChange }: Props) {
  const sourceValue = filters.source ?? "all";
  const severityValue = filters.severity ?? "all";
  const modeValue = filters.mode ?? "all";

  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      <label className="text-xs">
        <span className="mb-1 block text-command-muted uppercase tracking-[0.16em]">Source</span>
        <select
          value={sourceValue}
          onChange={(e) =>
            onChange({
              ...filters,
              source: e.target.value === "all" ? undefined : (e.target.value as DashboardLogSource),
            })
          }
          className="w-full border border-command-line/60 bg-black/20 p-2 text-sm"
        >
          {sources.map((source) => (
            <option key={source} value={source}>
              {source}
            </option>
          ))}
        </select>
      </label>

      <label className="text-xs">
        <span className="mb-1 block text-command-muted uppercase tracking-[0.16em]">Severity</span>
        <select
          value={severityValue}
          onChange={(e) =>
            onChange({
              ...filters,
              severity: e.target.value === "all" ? undefined : (e.target.value as DashboardLogSeverity),
            })
          }
          className="w-full border border-command-line/60 bg-black/20 p-2 text-sm"
        >
          {severities.map((severity) => (
            <option key={severity} value={severity}>
              {severity}
            </option>
          ))}
        </select>
      </label>

      <label className="text-xs">
        <span className="mb-1 block text-command-muted uppercase tracking-[0.16em]">Mode</span>
        <select
          value={modeValue}
          onChange={(e) =>
            onChange({
              ...filters,
              mode: e.target.value === "all" ? undefined : (e.target.value as DashboardLogMode),
            })
          }
          className="w-full border border-command-line/60 bg-black/20 p-2 text-sm"
        >
          {modes.map((mode) => (
            <option key={mode} value={mode}>
              {mode}
            </option>
          ))}
        </select>
      </label>

      <label className="text-xs">
        <span className="mb-1 block text-command-muted uppercase tracking-[0.16em]">Search</span>
        <input
          value={filters.query ?? ""}
          onChange={(e) => onChange({ ...filters, query: e.target.value || undefined })}
          placeholder="Search summary or type"
          className="w-full border border-command-line/60 bg-black/20 p-2 text-sm"
        />
      </label>
    </div>
  );
}
