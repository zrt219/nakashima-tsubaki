"use client";

import { useMemo, useState } from "react";
import { DashboardLogFilter, DashboardLogEvent } from "@/lib/dashboard-logs/types";
import { addLogEvent, clearLogs, filterLogs, readLogs } from "@/lib/dashboard-logs/logStore";
import { DashboardLogFilters } from "@/components/logs/DashboardLogFilters";
import { DashboardLogTable } from "@/components/logs/DashboardLogTable";
import { DashboardLogDetailDrawer } from "@/components/logs/DashboardLogDetailDrawer";
import { compactLogLine } from "@/lib/dashboard-logs/formatLog";

export function DashboardLogsPage() {
  const [logs, setLogs] = useState<DashboardLogEvent[]>(() => readLogs());
  const [filters, setFilters] = useState<DashboardLogFilter>({});
  const [selected, setSelected] = useState<DashboardLogEvent | undefined>();

  const refresh = () => setLogs(readLogs());

  const visibleLogs = useMemo(() => filterLogs(logs, filters), [logs, filters]);

  const copyLogs = () => {
    const payload = JSON.stringify(visibleLogs, null, 2);
    navigator.clipboard?.writeText(payload).catch(() => {});
    addLogEvent({
      source: "system",
      type: "logs_exported",
      severity: "info",
      summary: "Dashboard logs exported to clipboard",
      mode: "demo",
      details: { count: visibleLogs.length },
    });
    refresh();
  };

  const handleClear = () => {
    clearLogs();
    setLogs([]);
    setSelected(undefined);
    addLogEvent({
      source: "system",
      type: "logs_cleared",
      severity: "warning",
      summary: "Local logs cleared by operator",
      mode: "mock",
      details: {},
    });
  };

  return (
    <section className="space-y-4">
      <div className="grid gap-2 md:flex md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Dashboard Logs</h1>
          <p className="text-xs uppercase tracking-[0.16em] text-command-muted">
            Unified visibility for IoT health checks, query tests, and proof/audit actions.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyLogs}
            className="border border-cyan-400/35 px-3 py-1.5 text-[10px] uppercase"
          >
            Export Logs
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="border border-amber-400/35 px-3 py-1.5 text-[10px] uppercase"
          >
            Clear Logs
          </button>
          <button
            type="button"
            onClick={refresh}
            className="border border-emerald-400/35 px-3 py-1.5 text-[10px] uppercase"
          >
            Refresh
          </button>
        </div>
      </div>

      <DashboardLogFilters filters={filters} onChange={setFilters} />

      <div className="space-y-2 text-xs">
        <p className="text-command-muted">Latest records: {visibleLogs.length}</p>
        <DashboardLogTable events={visibleLogs} onSelect={setSelected} />
      </div>

      <p className="text-[11px] text-command-muted">
        Tip: each row is copyable. Open a row to inspect structured payload and context.
      </p>

      {selected ? (
        <DashboardLogDetailDrawer
          event={selected}
          onClose={() => setSelected(undefined)}
        />
      ) : null}

      {visibleLogs.length > 0 ? (
        <div className="rounded border border-cyan-900/30 bg-black/30 p-2 text-xs text-cyan-200">
          <p>Latest summary: {compactLogLine(visibleLogs[0]!)}</p>
        </div>
      ) : null}
    </section>
  );
}
