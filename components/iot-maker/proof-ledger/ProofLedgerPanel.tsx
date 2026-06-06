"use client";

import { useMemo, useState } from "react";
import { ProofAnchorCard } from "@/components/iot-maker/proof-ledger/ProofAnchorCard";
import { ProofNetworkSelector } from "@/components/iot-maker/proof-ledger/ProofNetworkSelector";
import { ProofTimeline } from "@/components/iot-maker/proof-ledger/ProofTimeline";
import { AnchorProofButton } from "@/components/iot-maker/proof-ledger/AnchorProofButton";
import { VerifyProofButton } from "@/components/iot-maker/proof-ledger/VerifyProofButton";
import { ProofStatusBadge } from "@/components/iot-maker/proof-ledger/ProofStatusBadge";
import { Panel } from "@/components/tn-command-center/command-center-primitives";
import type { ProofAnchorResult } from "@/lib/proof-ledger/types";

type ProofSummary = {
  id: string;
  runId: string;
  scenarioId: string | null;
  network: string;
  evidenceHash: string;
  transactionHash?: string;
  ledgerIndex: number | null;
  blockNumber: number | null;
  explorerUrl: string | null;
  evidenceBytes32: string | null;
  status: "mock_anchored" | "submitted" | "confirmed" | "failed" | "disabled" | "pending";
  createdAt: string;
};

type ProofNetworkState = {
  ready: boolean;
  description: string;
  config?: {
    ws?: boolean;
    seed?: boolean;
    destination?: boolean;
    jsonRpc?: boolean;
    rpcUrl?: boolean;
    privateKey?: boolean;
    contractAddress?: boolean;
    chainId?: string;
  };
};

type ProofReadiness = {
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

type ProofStatusPayload = {
  mode: "mock" | "xrpl_testnet" | "hedera_testnet" | "disabled";
  networks: {
    mock: ProofNetworkState;
    xrpl_testnet: ProofNetworkState;
    hedera_testnet: ProofNetworkState;
    disabled: ProofNetworkState;
  };
  latestProof: ProofSummary[];
  safetyNote: string;
  generatedAt: string;
};

type VerificationState = {
  verified: boolean;
  detail: string;
};

type PanelState = {
  selectedNetwork: "mock" | "xrpl_testnet" | "hedera_testnet" | "disabled";
};

type Props = {
  healthMode: "demo" | "partial" | "connected" | "blocked";
  healthProofMode: "mock" | "xrpl_testnet" | "hedera_testnet" | "disabled";
  proofReadiness: ProofReadiness;
  proofStatus: ProofStatusResponse | null;
  latestEvidence: LastEvidencePacket | null;
  onAnchorComplete: () => void;
};

export type ProofStatusResponse = ProofStatusPayload;

export type LastAnchorResponse = ProofAnchorResult | { error: string };
export type LastEvidencePacket = {
  telemetrySnapshotHash?: string;
  aiRecommendationHash?: string;
  operatorApprovalHash?: string;
  commandDispatchHash?: string;
  eventLedgerHash?: string;
  createdAt?: string;
  runId?: string;
  scenarioId?: string;
  mode?: string;
};

export function ProofLedgerPanel({
  healthMode,
  healthProofMode,
  proofReadiness,
  proofStatus,
  latestEvidence,
  onAnchorComplete
}: Props) {
  const [panelState, setPanelState] = useState<PanelState>({
    selectedNetwork: "mock",
  });
  const [verification, setVerification] = useState<VerificationState | null>(null);
  const [lastAnchorResponse, setLastAnchorResponse] = useState<LastAnchorResponse | null>(null);

  const proofPayload = proofStatus?.latestProof ?? [];
  const latest = proofPayload[0];
  const selectedEvidenceHash = latest?.evidenceHash;

  const networkCards = useMemo(
    () => [
      {
        key: "mock" as const,
        label: "Mock Proof",
        ready: proofReadiness.mockReady,
        description: "Deterministic mock anchor chain. Safe without server keys.",
      },
      {
        key: "xrpl_testnet" as const,
        label: "XRPL Testnet Memo Anchor",
        ready: proofReadiness.xrplReady,
        description: "Anchors packet hashes to XRPL memo field over Payment txns.",
      },
      {
        key: "hedera_testnet" as const,
        label: "Hedera Testnet Contract Anchor",
        ready: proofReadiness.hederaReady,
        description: "Calls TNProofLedger.anchorEvidence on Hedera EVM.",
      },
      {
        key: "disabled" as const,
        label: "Proof Disabled",
        ready: healthProofMode === "disabled",
        description: "No network anchoring. Evidence hashes remain local only.",
      },
    ],
    [proofReadiness, healthProofMode]
  );

  return (
    <Panel title="Proof Ledger" kicker="Hash anchoring and verification" icon="hash" accent="violet">
      <p className="mb-3 text-sm text-slate-300">
        {healthMode === "blocked"
          ? "Proof controls are available but command execution remains blocked until approval policy is safe."
          : "Evidence packets are ready to be hashed and anchored to configured proof backends."}
      </p>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
        <div className="border border-command-line/60 bg-black/20 p-3">
          <h3 className="text-xs uppercase tracking-[0.16em] text-cyan-300">Readiness</h3>
          <ul className="mt-2 space-y-1 text-xs text-slate-300">
            <li>
              Proof mode: <span className="font-mono text-cyan-200">{healthProofMode}</span>
            </li>
            <li>
              Mock readiness: <span className="text-emerald-300">{proofReadiness.mockReady ? "ready" : "not ready"}</span>
            </li>
            <li>
              XRPL readiness: <span className="text-emerald-300">{proofReadiness.xrplReady ? "ready" : "not ready"}</span>
            </li>
            <li>
              Hedera readiness:{" "}
              <span className="text-emerald-300">{proofReadiness.hederaReady ? "ready" : "not ready"}</span>
            </li>
            <li className="text-xs text-command-muted">XRPL config: ws={String(proofReadiness.xrplConfig.ws)}, seed={String(proofReadiness.xrplConfig.seed)}, destination={String(proofReadiness.xrplConfig.destination)}</li>
            <li className="text-xs text-command-muted">
              Hedera config: rpc={String(proofReadiness.hederaConfig.rpcUrl)}, key={String(proofReadiness.hederaConfig.privateKey)}, contract={String(proofReadiness.hederaConfig.contractAddress)}
            </li>
          </ul>

          <div className="mt-3 border border-command-line/40 bg-black/30 p-2">
            <ProofNetworkSelector
              selectedNetwork={panelState.selectedNetwork}
              onSelect={(key) =>
                setPanelState((prev) => ({
                  ...prev,
                  selectedNetwork: key,
                }))
              }
              networks={networkCards}
            />
          </div>
        </div>

        <div className="space-y-3">
            <ProofAnchorCard anchor={latest} />

          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.16em] text-cyan-300">Latest evidence</p>
            <div className="border border-cyan-900/40 bg-black/20 p-3 text-xs text-slate-300">
              <p>evidence hash: {latestEvidence?.telemetrySnapshotHash ? `${latestEvidence.telemetrySnapshotHash.slice(0, 20)}...` : "n/a"}</p>
              <p>runId: {latestEvidence?.runId ? latestEvidence.runId : "n/a"}</p>
              <p>mode: {latestEvidence?.mode ?? "n/a"}</p>
              <p>created: {latestEvidence?.createdAt ?? "n/a"}</p>
            </div>
          </div>

            <AnchorProofButton
            proofMode={healthProofMode}
            selectedMode={panelState.selectedNetwork}
            evidence={latestEvidence ? { ...latestEvidence, runId: latestEvidence.runId ?? "iot-run" } : null}
            onAnchored={(result) => {
              setLastAnchorResponse(result);
              onAnchorComplete();
            }}
          />

          <VerifyProofButton
            proofMode={panelState.selectedNetwork === "disabled" ? healthProofMode : panelState.selectedNetwork}
            evidenceHash={selectedEvidenceHash}
            onVerified={(result) => setVerification(result)}
          />
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        {verification && (
          <div className="border border-cyan-500/35 bg-cyan-500/8 p-2 text-xs text-cyan-100">
            <p className="font-semibold">Verification</p>
            <p>Status: <ProofStatusBadge status={verification.verified ? "confirmed" : "failed"} /></p>
            <p className="mt-1 text-command-muted">{verification.detail}</p>
          </div>
        )}
        {lastAnchorResponse && (
          <div className="border border-emerald-500/35 bg-emerald-500/8 p-2 text-xs text-emerald-100">
            <p className="font-semibold">Anchor response</p>
            <p className="mt-1 break-all text-command-muted">Result captured in status panel and backend ledger.</p>
          </div>
        )}
      </div>

      <div className="mt-4 border border-command-line/60 bg-black/25 p-3">
        <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Safety copy</p>
        <ul className="mt-2 space-y-1 text-[11px] text-slate-300">
          <li>Only hashes are anchored.</li>
          <li>Operational data remains off-chain.</li>
          <li>Blockchain does not control the machine.</li>
          <li>Operator approval is still required for command execution.</li>
        </ul>
      </div>

      <div className="mt-3">
        <ProofTimeline entries={proofPayload} />
      </div>

        {proofStatus?.safetyNote && <p className="mt-3 text-[11px] text-command-muted">{proofStatus.safetyNote}</p>}
      </Panel>
  );
}
