// lib/proof-ledger/types.ts

export type ProofMode =
  | "mock"
  | "xrpl_testnet"
  | "hedera_testnet"
  | "disabled";

export type EvidencePacket = {
  runId: string;
  scenarioId: string;
  mode: string;
  telemetrySnapshotHash: string;
  aiRecommendationHash: string;
  operatorApprovalHash: string;
  commandDispatchHash: string;
  eventLedgerHash: string;
  createdAt: string;
  app: "tsubaki-nakashima-ai";
  module: "iot-maker";
};

export type ProofAnchorResult = {
  proofMode: ProofMode;
  network: string;
  evidenceHash: string;
  evidenceBytes32: string;
  transactionHash?: string;
  ledgerIndex?: number;
  blockNumber?: number;
  contractAddress?: string;
  explorerUrl?: string;
  status: "mock_anchored" | "submitted" | "confirmed" | "failed" | "disabled";
  error?: string;
};

export interface ProofAdapter {
  anchor(packet: EvidencePacket): Promise<ProofAnchorResult>;
  verify(evidenceHash: string): Promise<{ verified: boolean; detail: string }>;
}
