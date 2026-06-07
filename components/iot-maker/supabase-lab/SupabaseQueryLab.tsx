"use client";

import { useMemo, useState } from "react";
import { addLogEvent } from "@/lib/dashboard-logs/logStore";
import { SupabaseQueryEditor } from "@/components/iot-maker/supabase-lab/SupabaseQueryEditor";
import { SupabaseQueryPresetList } from "@/components/iot-maker/supabase-lab/SupabaseQueryPresetList";
import { SupabaseQueryResults } from "@/components/iot-maker/supabase-lab/SupabaseQueryResults";
import { SupabaseSafetyNotice } from "@/components/iot-maker/supabase-lab/SupabaseSafetyNotice";
import { Panel } from "@/components/tn-command-center/command-center-primitives";

type Preset = { id: string; label: string };

type QueryResult = {
  safeQueryLabel: string;
  preset: string;
  status: "success" | "failed" | "simulated";
  durationMs: number;
  rowCount: number;
  columns: string[];
  rows: Array<Record<string, unknown>>;
  usedMockData: boolean;
  mockReason?: string;
};

type ApiQueryResult = QueryResult & {
  id: string;
  startedAt: string;
  finishedAt: string;
};

type ErrorPayload = {
  error: string;
  detail: string;
  startedAt: string;
};

function isErrorPayload(payload: ApiQueryResult | ErrorPayload): payload is ErrorPayload {
  return typeof payload === "object" && payload !== null && "error" in payload;
}

const PRESETS: Preset[] = [
  { id: "latest_telemetry", label: "Latest Telemetry" },
  { id: "recent_events", label: "Recent Event Ledger" },
  { id: "active_scenarios", label: "Active Scenarios" },
  { id: "command_queue", label: "Command Queue" },
  { id: "proof_anchors", label: "Proof Ledger Anchors" },
  { id: "health_summary", label: "Health Summary" },
];

export function SupabaseQueryLab() {
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]!.id);
  const [rawQuery, setRawQuery] = useState("");
  const [result, setResult] = useState<QueryResult | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [allowRaw, setAllowRaw] = useState(false);

  const selectedLabel = useMemo(
    () => PRESETS.find((preset) => preset.id === selectedPreset)?.label ?? "Unknown preset",
    [selectedPreset]
  );

  const runQuery = async () => {
    setLoading(true);
    setStatusMessage("");
    setResult(null);

    addLogEvent({
      source: "supabase",
      type: "supabase_query_started",
      severity: "info",
      summary: `Supabase query started for ${selectedPreset}`,
      details: { preset: selectedPreset, usedRawSql: allowRaw && rawQuery.trim().length > 0 },
      mode: "mock",
    });

    try {
      const startedAt = new Date().toISOString();
      const response = await fetch("/api/iot-maker/supabase-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preset: selectedPreset,
          rawSql: allowRaw ? rawQuery : undefined,
        }),
      });

      const payload = (await response.json()) as ApiQueryResult | ErrorPayload;

      if (!response.ok) {
        const summary = isErrorPayload(payload) ? payload.error : "Supabase query failed";
        addLogEvent({
          source: "supabase",
          type: "supabase_query_failed",
          severity: "error",
          summary,
          details: payload,
          durationMs: undefined,
          mode: "mock",
        });
        setStatusMessage(summary);
        setResult(null);
        return;
      }

      const safePayload = payload as ApiQueryResult;
      const durationMs =
        startedAt && "finishedAt" in payload
          ? Math.max(0, Date.parse(payload.finishedAt) - Date.parse(startedAt))
          : undefined;

      const next = {
        safeQueryLabel: safePayload.safeQueryLabel,
        preset: safePayload.preset,
        status: safePayload.status,
        durationMs: safePayload.durationMs,
        rowCount: safePayload.rowCount,
        columns: safePayload.columns,
        rows: safePayload.rows,
        usedMockData: safePayload.usedMockData,
        mockReason: safePayload.mockReason,
      } satisfies QueryResult;

      setResult(next);

      addLogEvent({
        source: "supabase",
        type: safePayload.usedMockData ? "supabase_query_simulated" : "supabase_query_succeeded",
        severity: "success",
        summary: `Supabase query completed for ${selectedPreset}`,
        details: { status: safePayload.status, rows: safePayload.rowCount, preset: selectedPreset },
        durationMs: safePayload.durationMs,
        mode: safePayload.usedMockData ? "mock" : "connected",
      });
    } catch {
      const summary = "Supabase query request failed";
      setStatusMessage(summary);
      addLogEvent({
        source: "supabase",
        type: "supabase_query_failed",
        severity: "error",
        summary,
        details: { preset: selectedPreset },
        mode: "demo",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    if (!result) return;
    const payload = JSON.stringify(
      {
        preset: selectedPreset,
        label: selectedLabel,
        status: result.status,
        durationMs: result.durationMs,
        rowCount: result.rowCount,
        usedMockData: result.usedMockData,
        mockReason: result.mockReason,
        columns: result.columns,
        rows: result.rows,
      },
      null,
      2
    );
    navigator.clipboard?.writeText(payload).catch(() => {});
    setStatusMessage("Result copied to clipboard.");
  };

  return (
    <Panel title="Query Lab" kicker="Safe data inspection" icon="database" accent="violet">
      <p className="mb-3 text-sm text-slate-300">
        Use safe read-only query presets to validate schema and telemetry/event tables. In
        disconnected mode, demo results are returned.
      </p>

      <div className="grid gap-3 lg:grid-cols-[250px_1fr]">
        <SupabaseQueryPresetList
          presets={PRESETS}
          selectedPreset={selectedPreset}
          onSelect={(value) => setSelectedPreset(value)}
        />
        <SupabaseQueryEditor
          rawQuery={rawQuery}
          onChangeRawQuery={setRawQuery}
          allowRaw={allowRaw}
          onRun={runQuery}
          running={loading}
          disabled={loading}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="text-xs text-command-muted">
          <input
            type="checkbox"
            checked={allowRaw}
            onChange={(e) => setAllowRaw(e.target.checked)}
            className="mr-2"
          />
          Enable raw SQL mode (read-only allowlist only)
        </label>
        <button
          type="button"
          onClick={runQuery}
          disabled={loading}
          className="border border-emerald-400/35 bg-emerald-500/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-emerald-200"
        >
          {loading ? "Running query..." : "Run Query"}
        </button>
        <button
          type="button"
          onClick={copyResult}
          disabled={!result}
          className="border border-cyan-400/35 bg-cyan-400/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-cyan-200 disabled:opacity-40"
        >
          Copy Result
        </button>
      </div>

      <SupabaseQueryResults result={result} loading={loading} statusMessage={statusMessage} />
      <p className="mt-2 text-xs text-command-muted">
        Active preset: <span className="text-white">{selectedLabel}</span>
      </p>

      <div className="mt-4">
        <SupabaseQueryLogPanel />
      </div>

      <div className="mt-3">
        <SupabaseSafetyNotice showRawSql={allowRaw} />
      </div>
    </Panel>
  );
}

function SupabaseQueryLogPanel() {
  return (
    <div className="rounded border border-command-line/60 bg-black/30 p-3 text-xs">
      <p className="mb-2 font-semibold uppercase tracking-[0.14em] text-cyan-300">Supabase log events</p>
      <p className="text-command-muted">
        Events are captured in Dashboard Logs with source <span className="font-mono">supabase</span> for each query attempt.
      </p>
      <p className="mt-2 text-cyan-200">Open Dashboard Logs for full event timeline and filters.</p>
      <p className="mt-1 text-command-muted">This panel intentionally stays compact; open Logs for full event inspection.</p>
    </div>
  );
}
