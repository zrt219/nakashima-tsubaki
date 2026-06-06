"use client";

import { useState } from "react";
import type { ProofAnchorResult } from "@/lib/proof-ledger/types";

type ProofPacketPayload = {
  evidence?: {
    runId?: string;
    scenarioId?: string;
    telemetrySnapshotHash?: string;
    aiRecommendationHash?: string;
    operatorApprovalHash?: string;
    commandDispatchHash?: string;
    eventLedgerHash?: string;
    createdAt?: string;
    app?: string;
    module?: string;
    mode?: string;
  };
  mode?: "mock" | "xrpl_testnet" | "hedera_testnet" | "disabled";
};

type Props = {
  proofMode: "mock" | "xrpl_testnet" | "hedera_testnet" | "disabled";
  selectedMode: "mock" | "xrpl_testnet" | "hedera_testnet" | "disabled";
  evidence: ProofPacketPayload["evidence"] | null;
  onAnchored: (result: ProofAnchorResult) => void;
};

export function AnchorProofButton({ proofMode, selectedMode, evidence, onAnchored }: Props) {
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState("");

  const handleClick = async () => {
    if (!evidence) return;
    setIsBusy(true);
    setError("");

    try {
      const overrideMode = proofMode === "disabled" ? selectedMode : selectedMode;
      const payload = {
        mode: overrideMode,
        evidencePacket: {
          runId: evidence.runId,
          scenarioId: evidence.scenarioId ?? "unknown",
          mode: evidence.mode ?? proofMode ?? "mock",
          telemetrySnapshotHash: evidence.telemetrySnapshotHash ?? "",
          aiRecommendationHash: evidence.aiRecommendationHash ?? "",
          operatorApprovalHash: evidence.operatorApprovalHash ?? "",
          commandDispatchHash: evidence.commandDispatchHash ?? "",
          eventLedgerHash: evidence.eventLedgerHash ?? "",
          app: evidence.app ?? "tsubaki-nakashima-ai",
          module: evidence.module ?? "iot-maker",
        },
      };

      const response = await fetch("/api/proof-ledger/anchor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as {
        success: boolean;
        data?: ProofAnchorResult;
        error?: string;
        detail?: string;
      };

      if (!response.ok || result.success === false) {
        setError(result.error || result.detail || "Anchor request failed.");
        return;
      }

      if (result.data) {
        onAnchored(result.data);
      } else {
        setError("Anchor returned no data.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Anchor request failed.");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isBusy || !evidence}
        className="w-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-100 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-emerald-500/20"
      >
        {isBusy ? "Anchoring..." : `Anchor Evidence (${selectedMode})`}
      </button>
      {error && <p className="text-xs text-red-300">{error}</p>}
    </div>
  );
}
