"use client";

import { useEffect, useMemo, useState } from "react";
import { overviewEvents } from "@/lib/tn-ai-data";
import { IoTMakerHero } from "@/components/iot-maker/IoTMakerHero";
import { RuntimeModeBanner } from "@/components/iot-maker/RuntimeModeBanner";
import { IoTMakerTopology } from "@/components/iot-maker/IoTMakerTopology";
import { DemoModePanel } from "@/components/iot-maker/DemoModePanel";
import { ConnectedModePanel } from "@/components/iot-maker/ConnectedModePanel";
import { ReadinessCheckGrid } from "@/components/iot-maker/ReadinessCheckGrid";
import { CommandFlowTestRunner } from "@/components/iot-maker/CommandFlowTestRunner";
import { SafetyBoundaryMatrix } from "@/components/iot-maker/SafetyBoundaryMatrix";
import { SetupExportPanel } from "@/components/iot-maker/SetupExportPanel";
import { ProofLedgerPanel } from "@/components/iot-maker/proof-ledger/ProofLedgerPanel";
import { GeminiQueryLab } from "@/components/iot-maker/gemini-lab/GeminiQueryLab";
import { SupabaseQueryLab } from "@/components/iot-maker/supabase-lab/SupabaseQueryLab";
import type {
  LastEvidencePacket,
  ProofStatusResponse,
} from "@/components/iot-maker/proof-ledger/ProofLedgerPanel";
import { EnvChecklist } from "@/components/iot-maker/EnvChecklist";
import { IoTMakerEventLedger } from "@/components/iot-maker/IoTMakerEventLedger";
import type { ReadinessCheck } from "@/lib/iot-maker/types";
import { ExplainThis } from "@/components/education/ExplainThis";

type TabId =
  | "queryLabs"
  | "topology"
  | "demo"
  | "connected"
  | "readiness"
  | "commandFlow"
  | "safety"
  | "proofLedger"
  | "setup";

type HealthResponse = {
  runtimeMode: "demo" | "partial" | "connected" | "blocked";
  services: ReadinessCheck[];
  envChecks: Array<{
    key: string;
    present: boolean;
    masked: string;
    required: "demo" | "connected" | "optional";
    serverOnly: boolean;
    description: string;
  }>;
  warnings: string[];
  safetyStatus: {
    approvalGateActive: boolean;
    directMachineControlDisabled: boolean;
  };
  proofStatus: {
    mode: "mock" | "xrpl_testnet" | "hedera_testnet" | "disabled";
    mockReady: boolean;
    xrplReady: boolean;
    hederaReady: boolean;
    xrplConfig: {
      ws: boolean;
      seed: boolean;
      destination: boolean;
      jsonRpc: boolean;
    };
    hederaConfig: {
      rpcUrl: boolean;
      privateKey: boolean;
      contractAddress: boolean;
      chainId: string | null;
    };
  };
  generatedAt: string;
};

type CommandFlowReport = {
  runId?: string;
  scenarioId?: string;
  runtimeMode?: "demo" | "partial" | "connected" | "blocked";
  proofMode?: "mock" | "xrpl_testnet" | "hedera_testnet" | "disabled";
  dispatchStatus?: string;
  operatorApprovalStatus?: "required" | "approved" | "rejected" | "blocked";
  evidence?: {
    sha256Hex?: string;
    bytes32?: string;
    packet?: {
      telemetrySnapshotHash?: string;
      aiRecommendationHash?: string;
      operatorApprovalHash?: string;
      commandDispatchHash?: string;
      eventLedgerHash?: string;
      createdAt?: string;
      scenarioId?: string;
      runId?: string;
      mode?: string;
    };
  };
  proofAnchor?: {
    network?: string;
    status?: string;
    evidenceHash?: string;
    evidenceBytes32?: string;
    transactionHash?: string;
    blockNumber?: number;
    ledgerIndex?: number;
    explorerUrl?: string;
  };
  generatedAt?: string;
};

type LedgerEvent = {
  id: string;
  timestamp: string;
  source: string;
  event: string;
  detail: string;
};

const TABS = [
  { id: "topology", label: "Topology" },
  { id: "demo", label: "Demo Mode" },
  { id: "connected", label: "Connected Mode" },
  { id: "readiness", label: "Readiness Checks" },
  { id: "commandFlow", label: "Command Flow Test" },
  { id: "queryLabs", label: "Query Labs" },
  { id: "safety", label: "Safety Boundary" },
  { id: "proofLedger", label: "Proof Ledger" },
  { id: "setup", label: "Setup Export" },
] as const;

function normalizeReadinessChecks(checks: ReadinessCheck[] = []) {
  return checks.map((check) => ({
    ...check,
    status: check.status
  }));
}

export function IoTMakerCenter() {
  const [activeTab, setActiveTab] = useState<TabId>("topology");
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [proofStatus, setProofStatus] = useState<ProofStatusResponse | null>(null);
  const [lastFlow, setLastFlow] = useState<CommandFlowReport | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [runtimeMode, setRuntimeMode] = useState<"demo" | "partial" | "connected" | "blocked">("demo");
  const [isSafe, setIsSafe] = useState(true);

  const [ledgerEvents, setLedgerEvents] = useState<LedgerEvent[]>([]);

  const activeChecks = health ? normalizeReadinessChecks(health.services) : [];
  const activeEnvChecks = health ? health.envChecks : [];

  const proofMode = health?.proofStatus.mode ?? "mock";
  const proofReadiness = health?.proofStatus
    ? {
        mockReady: health.proofStatus.mockReady,
        xrplReady: health.proofStatus.xrplReady,
        hederaReady: health.proofStatus.hederaReady,
        xrplConfig: health.proofStatus.xrplConfig,
        hederaConfig: health.proofStatus.hederaConfig,
      }
    : {
        mockReady: true,
        xrplReady: false,
        hederaReady: false,
        xrplConfig: { ws: false, seed: false, destination: false, jsonRpc: false },
        hederaConfig: { rpcUrl: false, privateKey: false, contractAddress: false, chainId: null },
      };

  const latestEvidencePacket = useMemo<LastEvidencePacket | null>(() => {
    if (!lastFlow?.evidence?.packet) return null;
    return {
      runId: lastFlow.evidence.packet.runId,
      scenarioId: lastFlow.evidence.packet.scenarioId,
      telemetrySnapshotHash: lastFlow.evidence.packet.telemetrySnapshotHash,
      aiRecommendationHash: lastFlow.evidence.packet.aiRecommendationHash,
      operatorApprovalHash: lastFlow.evidence.packet.operatorApprovalHash,
      commandDispatchHash: lastFlow.evidence.packet.commandDispatchHash,
      eventLedgerHash: lastFlow.evidence.packet.eventLedgerHash,
      createdAt: lastFlow.evidence.packet.createdAt,
      mode: lastFlow.evidence.packet.mode,
    };
  }, [lastFlow]);

  const handleFlowComplete = (report: CommandFlowReport) => {
    setLastFlow(report);
    const now = new Date().toISOString();
    const event: LedgerEvent = {
      id: `${report.runId ?? now}-${report.generatedAt ?? now}`,
      timestamp: now,
      source: "command_flow",
      event: "Command Flow Test Completed",
      detail: `run=${report.runId ?? "n/a"}, scenario=${report.scenarioId ?? "n/a"}, mode=${report.runtimeMode ?? "n/a"}, approval=${report.operatorApprovalStatus ?? "n/a"}, dispatch=${report.dispatchStatus ?? "n/a"}`,
    };
    setLedgerEvents((prev) => [event, ...prev].slice(0, 8));
    refreshProofStatus();
  };

  const loadHealth = async () => {
    try {
      const healthRes = await fetch("/api/iot-maker/health");
      if (!healthRes.ok) {
        throw new Error("Health endpoint unavailable.");
      }
      const data = (await healthRes.json()) as HealthResponse;
      setHealth(data);
      setRuntimeMode(data.runtimeMode);
      setIsSafe(
        Boolean(data.safetyStatus?.approvalGateActive) && Boolean(data.safetyStatus?.directMachineControlDisabled)
      );
      setLoadError(null);
    } catch (error: unknown) {
      setLoadError(error instanceof Error ? error.message : "Failed to load IoT maker health.");
      setRuntimeMode("blocked");
      setIsSafe(false);
    }
  };

  const loadProofStatus = async () => {
    try {
      const proofRes = await fetch("/api/proof-ledger/status");
      if (!proofRes.ok) {
        throw new Error("Proof status endpoint unavailable.");
      }
      const data = (await proofRes.json()) as ProofStatusResponse;
      setProofStatus(data);
    } catch {
      setProofStatus(null);
    }
  };

  const refreshProofStatus = () => {
    loadProofStatus();
  };

  useEffect(() => {
    const bootTimer = window.setTimeout(() => {
      void loadHealth();
      void loadProofStatus();
    }, 0);
    const interval = setInterval(() => {
      void loadHealth();
      void loadProofStatus();
    }, 30000);
    return () => {
      window.clearTimeout(bootTimer);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="space-y-4">
      <IoTMakerHero />
      <RuntimeModeBanner runtimeMode={runtimeMode} proofMode={proofMode} isSafe={isSafe} />

      {loadError && (
        <div className="border border-red-400/40 bg-red-500/10 p-3 text-xs text-red-100">
          {loadError}
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[1fr_auto]">
        <div className="rounded border border-command-line/60 bg-black/20 p-2">
          <div className="mb-3 flex flex-wrap gap-2">
          {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                  activeTab === tab.id
                    ? "border-cyan-400/60 bg-cyan-400/15 text-cyan-100"
                    : "border-command-line/40 bg-black/30 text-command-muted hover:border-cyan-400/40 hover:text-cyan-200"
                }`}
                onClick={() => setActiveTab(tab.id as TabId)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "topology" && (
            <ExplainThis
              label="Topology"
              explanation="This diagram shows how the browser, Vercel runtime, Supabase, AWS IoT, AI provider, operator gate, edge bridge, and proof ledger connect in advisory-first commissioning."
            >
              <IoTMakerTopology />
            </ExplainThis>
          )}
          {activeTab === "demo" && (
            <ExplainThis
              label="Demo Mode"
              explanation="Demo Mode generates synthetic telemetry, runs deterministic advisory logic, and never sends real machine control. No cloud or field-bus commands are dispatched."
            >
              <DemoModePanel />
            </ExplainThis>
          )}
          {activeTab === "connected" && (
            <ExplainThis
              label="Connected Mode"
              explanation="Connected Mode shows what is available when cloud keys are present. It is a readiness and safety view, not an automatic live control path."
            >
              <ConnectedModePanel checks={activeChecks} envChecks={activeEnvChecks} warnings={health?.warnings ?? []} />
            </ExplainThis>
          )}
          {activeTab === "readiness" && (
            <ExplainThis
              label="Readiness Checks"
              explanation="These readiness checks show the explicit prerequisites for advisory execution and connected integration. A failed check blocks dispatch and keeps the flow safe."
            >
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
                <ReadinessCheckGrid checks={activeChecks} />
                <div className="rounded border border-cyan-900/60 bg-black/30 p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Ready-state summary</p>
                  <ul className="mt-2 space-y-1 text-[11px] text-slate-300">
                    <li>Mode: {runtimeMode}</li>
                    <li>Proof mode: {proofMode}</li>
                    <li>Operator approval gate active: {String(health?.safetyStatus.approvalGateActive ?? false)}</li>
                    <li>Direct machine control disabled: {String(health?.safetyStatus.directMachineControlDisabled ?? false)}</li>
                    <li>Connected prerequisites satisfied: {String(activeChecks.every((item) => item.status === "ready" || !item.requiredForConnected ? item.status !== "blocked" : true))}</li>
                  </ul>
                </div>
              </div>
            </ExplainThis>
          )}
          {activeTab === "commandFlow" && (
            <ExplainThis
              label="Command Flow Test"
              explanation="Run a full commissioning cycle: telemetry packet, recommendation, operator approval check, dispatch simulation, evidence hashing, and proof anchor."
            >
              <CommandFlowTestRunner onComplete={handleFlowComplete} />
            </ExplainThis>
          )}
          {activeTab === "queryLabs" && (
            <div className="grid gap-4 xl:grid-cols-2">
              <ExplainThis
                label="Supabase Query Lab"
                explanation="Read-only query presets are safe by default. In Demo Mode results are simulated so you can validate schema intent without live database risk."
              >
                <SupabaseQueryLab />
              </ExplainThis>
              <ExplainThis
                label="Gemini Query Lab"
                explanation="Test advisory prompts and structured action proposals. Tool proposals are visible but require operator policy for execution."
              >
                <GeminiQueryLab />
              </ExplainThis>
            </div>
          )}
          {activeTab === "safety" && (
            <ExplainThis
              label="Safety Boundary"
              explanation="The matrix is the definitive control boundary. AI can suggest only. Operators approve. Edge bridge dispatches only after approval. No direct PLC or blockchain control."
            >
              <SafetyBoundaryMatrix />
            </ExplainThis>
          )}
          {activeTab === "proofLedger" && (
            <ExplainThis
              label="Proof Ledger"
              explanation="Proof Ledger anchors only evidence hashes for audit traceability. Operational telemetry and command payloads are not written on-chain."
            >
              <ProofLedgerPanel
              healthMode={runtimeMode}
              healthProofMode={proofMode}
              proofReadiness={proofReadiness}
              proofStatus={proofStatus}
              latestEvidence={latestEvidencePacket}
              onAnchorComplete={refreshProofStatus}
              />
            </ExplainThis>
          )}
          {activeTab === "setup" && (
            <ExplainThis
              label="Setup Export"
              explanation="Server-side environment manifest for predictable bootstrapping. This feature exports local values for demo and connected setup only."
            >
              <div className="grid gap-4">
                <SetupExportPanel />
                <div className="rounded border border-command-line/60 bg-black/20 p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Server-side env visibility</p>
                  <EnvChecklist entries={activeEnvChecks} />
                </div>
              </div>
            </ExplainThis>
          )}
        </div>

        <div className="xl:w-[320px]">
          <IoTMakerEventLedger events={ledgerEvents.length > 0 ? ledgerEvents : []} />
          <div className="mt-3 border border-cyan-900/40 bg-black/40 p-3 text-xs text-cyan-200">
            <p className="font-semibold uppercase tracking-[0.16em]">Local ledger state</p>
            <p className="mt-2 text-slate-300">
              {lastFlow
                ? `${lastFlow.runId ?? "No run"} / ${lastFlow.scenarioId ?? "n/a"} / ${lastFlow.runtimeMode ?? "n/a"}`
                : "Run command flow to add events."
              }
            </p>
          </div>
        </div>
      </div>

      <div className="text-xs text-command-muted">
        Safety notes:
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>Only evidence hashes are anchored. Operational data remains off-chain.</li>
          <li>Blockchain networks are proof channels only. They cannot execute machine control.</li>
          <li>Operator approval remains the gate for command proposal acceptance.</li>
          <li>This route is mock-safe and testnet oriented by design.</li>
        </ul>
      </div>
    </div>
  );
}
