"use client";

import { ProofStatusBadge } from "./ProofStatusBadge";

type AnchorCardData = {
  id?: string;
  runId?: string;
  scenarioId?: string | null;
  network?: string;
  evidenceHash?: string;
  transactionHash?: string;
  blockNumber?: number | null;
  ledgerIndex?: number | null;
  block_hash?: string | null;
  explorerUrl?: string | null;
  evidenceBytes32?: string | null;
  status?: string;
  createdAt?: string;
};

export function ProofAnchorCard({ anchor }: { anchor?: AnchorCardData }) {
  if (!anchor) {
    return (
      <div className="border border-cyan-900/50 bg-black/30 p-3 text-xs text-command-muted">
        No proof anchors yet. Run a test to produce the first proof record.
      </div>
    );
  }

  return (
    <div className="space-y-2 border border-cyan-900/50 bg-black/30 p-3 text-xs">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold uppercase tracking-[0.14em] text-cyan-200">Anchor</p>
        <ProofStatusBadge status={anchor.status || "unknown"} />
      </div>
      <p>Run: {anchor.runId}</p>
      <p>Scenario: {anchor.scenarioId ?? "n/a"}</p>
      <p>Network: {anchor.network}</p>
      <p>Hash: {anchor.evidenceHash}</p>
      <p>Tx: {anchor.transactionHash ?? "pending"}</p>
      {anchor.blockNumber && <p>Block: {anchor.blockNumber}</p>}
      {anchor.ledgerIndex && <p>Ledger index: {anchor.ledgerIndex}</p>}
      {anchor.evidenceBytes32 && <p>Bytes32: {anchor.evidenceBytes32}</p>}
      {anchor.explorerUrl && (
        <a href={anchor.explorerUrl} target="_blank" rel="noreferrer" className="text-cyan-300 underline">
          explorer
        </a>
      )}
      <p className="text-command-muted">created at: {anchor.createdAt}</p>
    </div>
  );
}
