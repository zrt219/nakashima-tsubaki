"use client";

import { useState } from "react";
import { DEMO_SCENARIOS } from "@/lib/iot-maker/demoTelemetry";
import { Panel } from "@/components/tn-command-center/command-center-primitives";

type TestStep = {
  id: string;
  label: string;
  service: string;
  status: "passed" | "blocked" | "failed" | "running" | "pending";
  evidence?: string;
  timestamp?: string;
};

type DemoScenarioId = "thermal_drift" | "vibration_anomaly" | "blower_deviation" | "quality_hold" | "traceability_gap";

export type CommandFlowTestResponse = {
  runId?: string;
  scenarioId?: string;
  runtimeMode?: "demo" | "partial" | "connected" | "blocked";
  proofMode?: "mock" | "xrpl_testnet" | "hedera_testnet" | "disabled";
  steps?: TestStep[];
  telemetrySchemaOk?: boolean;
  commandProposal?: {
    commandId: string;
    type: string;
  };
  operatorApprovalStatus?: "required" | "approved" | "rejected" | "blocked";
  dispatchStatus?: string;
  dispatchRecord?: Record<string, unknown>;
  evidence?: {
    packet?: {
      telemetrySnapshotHash?: string;
      aiRecommendationHash?: string;
      operatorApprovalHash?: string;
      commandDispatchHash?: string;
      eventLedgerHash?: string;
      bytes32?: string;
    };
    sha256Hex?: string;
    bytes32?: string;
  };
  proofAnchor?: {
    status?: string;
    network?: string;
    transactionHash?: string;
    blockNumber?: number;
    ledgerIndex?: number;
    evidenceHash?: string;
    evidenceBytes32?: string;
    error?: string;
    explorerUrl?: string;
  };
  safetyGuarantees?: {
    noRealCommandDispatched: boolean;
    blockchainDidNotDispatch: boolean;
    approvalRequired: boolean;
    telemetryNotOnChain: boolean;
    promptsNotOnChain: boolean;
  };
  generatedAt?: string;
};

type Props = {
  onComplete?: (report: CommandFlowTestResponse) => void;
};

type LastRunState = {
  status: "idle" | "running" | "done" | "error";
  data: CommandFlowTestResponse | null;
  error: string | null;
};

export function CommandFlowTestRunner({ onComplete }: Props = {}) {
  const [selectedScenario, setSelectedScenario] = useState<DemoScenarioId>(DEMO_SCENARIOS[0]!.id);
  const [approveRequested, setApproveRequested] = useState(false);
  const [lastRun, setLastRun] = useState<LastRunState>({
    status: "idle",
    data: null,
    error: null,
  });

  const runTest = async () => {
    setLastRun({ status: "running", data: null, error: null });
    try {
      const res = await fetch("/api/iot-maker/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: selectedScenario,
          approve: approveRequested,
        }),
      });
      const payload = (await res.json()) as CommandFlowTestResponse;
      if (!res.ok) {
        setLastRun({ status: "error", data: null, error: payload?.proofAnchor?.error || "Command flow test failed." });
        onComplete?.({
          runId: payload.runId,
          scenarioId: payload.scenarioId,
          runtimeMode: payload.runtimeMode,
          proofMode: payload.proofMode,
          operatorApprovalStatus: payload.operatorApprovalStatus,
          dispatchStatus: payload.dispatchStatus,
          evidence: payload.evidence,
          proofAnchor: payload.proofAnchor,
          generatedAt: payload.generatedAt,
        });
        return;
      }
      setLastRun({ status: "done", data: payload, error: null });
      onComplete?.({
        runId: payload.runId,
        scenarioId: payload.scenarioId,
        runtimeMode: payload.runtimeMode,
        proofMode: payload.proofMode,
        operatorApprovalStatus: payload.operatorApprovalStatus,
        dispatchStatus: payload.dispatchStatus,
        evidence: payload.evidence,
        proofAnchor: payload.proofAnchor,
        generatedAt: payload.generatedAt,
      });
    } catch (error: unknown) {
      setLastRun({
        status: "error",
        data: null,
        error: error instanceof Error ? error.message : "Unknown test execution failure.",
      });
      onComplete?.({
        generatedAt: new Date().toISOString(),
      });
    }
  };

  return (
    <Panel title="Command Flow Test Runner" kicker="Demo harness" icon="flow" accent="emerald">
      <p className="mb-3 text-sm text-slate-300">
        Select a scenario, run the full chain, and inspect telemetry, approval state, and evidence hash anchoring output.
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="border border-command-line/60 bg-black/40 p-3">
          <label className="text-xs uppercase tracking-wider text-command-muted">Scenario</label>
          <select
            value={selectedScenario}
            onChange={(e) => setSelectedScenario(e.target.value as DemoScenarioId)}
            className="mt-2 w-full border border-command-line bg-black/20 p-2 text-sm text-white"
          >
            {DEMO_SCENARIOS.map((scenario) => (
              <option key={scenario.id} value={scenario.id}>
                {scenario.name}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 border border-command-line/60 bg-black/40 p-3 text-xs uppercase tracking-wider text-command-muted">
          <input
            type="checkbox"
            checked={approveRequested}
            onChange={(e) => setApproveRequested(e.target.checked)}
          />
          Simulate operator approval
        </label>
      </div>

      <button
        type="button"
        onClick={runTest}
        disabled={lastRun.status === "running"}
        className="mt-3 w-full border border-emerald-500/45 bg-emerald-500/12 px-3 py-2 font-mono text-xs uppercase tracking-[0.15em] text-emerald-100 transition hover:bg-emerald-500/25 disabled:opacity-50"
      >
        {lastRun.status === "running" ? "Running command flow..." : "Run Commissioning Test"}
      </button>

      {lastRun.status === "error" && (
        <div className="mt-3 border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">
          {lastRun.error}
        </div>
      )}

      {lastRun.status === "done" && lastRun.data && (
        <div className="mt-3 space-y-3">
          <div className="border border-cyan-400/30 bg-cyan-900/10 p-3 text-xs">
            <p className="font-semibold uppercase tracking-wider text-cyan-200">Run packet</p>
            <p className="mt-1 text-slate-200">runId: {lastRun.data.runId}</p>
            <p className="text-slate-200">scenarioId: {lastRun.data.scenarioId}</p>
            <p className="text-slate-200">runtimeMode: {lastRun.data.runtimeMode}</p>
            <p className="text-slate-200">
              telemetrySchemaOk: {String(lastRun.data.telemetrySchemaOk)}
            </p>
            <p className="text-slate-200">
              approval: {lastRun.data.operatorApprovalStatus} / dispatch: {lastRun.data.dispatchStatus}
            </p>
          </div>

          {lastRun.data.commandProposal && (
            <div className="border border-emerald-500/30 bg-emerald-900/10 p-3 text-xs">
              <p className="font-semibold uppercase tracking-wider text-emerald-200">Proposal</p>
              <p className="mt-1 text-slate-200">
                {lastRun.data.commandProposal.type} ({lastRun.data.commandProposal.commandId})
              </p>
            </div>
          )}

          {lastRun.data.safetyGuarantees && (
            <ul className="grid gap-1 border border-command-line/60 bg-black/30 p-3 text-[11px]">
              <li>Safety: no command control on chain: {String(lastRun.data.safetyGuarantees.blockchainDidNotDispatch)}</li>
              <li>Safety: no command dispatched in demo by default: {String(lastRun.data.safetyGuarantees.noRealCommandDispatched)}</li>
              <li>Safety: approval required: {String(lastRun.data.safetyGuarantees.approvalRequired)}</li>
              <li>Safety: telemetry not on chain: {String(lastRun.data.safetyGuarantees.telemetryNotOnChain)}</li>
              <li>Safety: prompts not on chain: {String(lastRun.data.safetyGuarantees.promptsNotOnChain)}</li>
            </ul>
          )}

          <div className="grid gap-2 md:grid-cols-2">
            <div className="border border-cyan-900/60 bg-black/30 p-3 text-xs">
              <p className="font-semibold text-cyan-200 uppercase tracking-wide">Evidence hashes</p>
              <p className="mt-1 text-slate-200">telemetry: {lastRun.data.evidence?.packet?.telemetrySnapshotHash}</p>
              <p className="text-slate-200">recommendation: {lastRun.data.evidence?.packet?.aiRecommendationHash}</p>
              <p className="text-slate-200">approval: {lastRun.data.evidence?.packet?.operatorApprovalHash}</p>
              <p className="text-slate-200">command: {lastRun.data.evidence?.packet?.commandDispatchHash}</p>
              <p className="text-slate-200">event ledger: {lastRun.data.evidence?.packet?.eventLedgerHash}</p>
            </div>

            <div className="border border-cyan-900/60 bg-black/30 p-3 text-xs">
              <p className="font-semibold text-cyan-200 uppercase tracking-wide">Proof anchor</p>
              <p className="mt-1 text-slate-200">status: {lastRun.data.proofAnchor?.status}</p>
              <p className="text-slate-200">network: {lastRun.data.proofAnchor?.network}</p>
              <p className="text-slate-200">tx: {lastRun.data.proofAnchor?.transactionHash || "—"}</p>
              <p className="text-slate-200">
                explorer: {lastRun.data.proofAnchor?.explorerUrl ? <span className="text-cyan-300">available</span> : "none"}
              </p>
              {lastRun.data.proofAnchor?.error && (
                <p className="text-red-300">error: {lastRun.data.proofAnchor.error}</p>
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs uppercase tracking-wider text-command-muted">Execution steps</p>
            <div className="space-y-2">
              {lastRun.data.steps?.map((step) => (
                <div key={step.id} className="flex items-start justify-between gap-3 border border-command-line/60 bg-black/30 p-2 text-xs">
                  <span>{step.label}</span>
                  <span className="font-mono text-[10px] text-amber-300 uppercase">{step.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
}
