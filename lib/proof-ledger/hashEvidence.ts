// lib/proof-ledger/hashEvidence.ts
// Server-side only — uses Node.js crypto.
// Do NOT import from client components.

import crypto from "crypto";
import { canonicalize } from "./canonicalize";
import type { EvidencePacket } from "./types";

export function hashEvidence(packet: EvidencePacket): {
  sha256Hex: string;
  bytes32: string;
  canonical: string;
} {
  const canonical = canonicalize(packet);
  const sha256Hex = crypto.createHash("sha256").update(canonical, "utf8").digest("hex");
  const normalized = sha256Hex.toLowerCase();
  const bytes32 = `0x${normalized}`;
  return { sha256Hex, bytes32, canonical };
}

export function hashString(input: string): string {
  return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}

export function buildPartialHashes(data: {
  telemetry: Record<string, unknown>;
  aiRecommendation: string;
  operatorApproval: string;
  commandDispatch: string;
  eventLedger: string;
}): Pick<EvidencePacket,
  | "telemetrySnapshotHash"
  | "aiRecommendationHash"
  | "operatorApprovalHash"
  | "commandDispatchHash"
  | "eventLedgerHash"
> {
  return {
    telemetrySnapshotHash: hashString(canonicalize(data.telemetry)),
    aiRecommendationHash: hashString(data.aiRecommendation),
    operatorApprovalHash: hashString(data.operatorApproval),
    commandDispatchHash: hashString(data.commandDispatch),
    eventLedgerHash: hashString(data.eventLedger),
  };
}
