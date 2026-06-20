// Server-only orchestration layer. Routes to the correct adapter based on PROOF_MODE.
// Never returns private keys, seeds, or raw secrets.

import crypto from "node:crypto";
import type { EvidencePacket, ProofAnchorResult, ProofMode } from "./types";
import { buildPartialHashes } from "./hashEvidence";
import { getExplorerUrl } from "./explorer";
import { mockProofAdapter } from "./adapters/mockProofAdapter";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/factories";
import { type SupabaseClient } from "@supabase/supabase-js";

export type ProofSummary = {
  id: string;
  run_id: string;
  scenario_id: string | null;
  evidence_hash: string;
  network: string;
  status: "mock_anchored" | "submitted" | "confirmed" | "failed" | "disabled" | "pending";
  explorer_url: string | null;
  transaction_hash: string | null;
  ledger_index: number | null;
  block_number: number | null;
  contract_address: string | null;
  evidence_bytes32: string | null;
  created_at: string;
};

export type ProofReadiness = {
  mode: ProofMode;
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

export function getProofMode(): ProofMode {
  const raw = process.env.PROOF_MODE;
  if (raw === "xrpl_testnet" || raw === "hedera_testnet" || raw === "disabled") {
    return raw;
  }
  return "mock";
}

async function getAdapter(mode?: ProofMode) {
  const resolved = mode ?? getProofMode();
  if (resolved === "xrpl_testnet") {
    const { xrplTestnetProofAdapter } = await import("./adapters/xrplTestnetProofAdapter");
    return xrplTestnetProofAdapter;
  }
  if (resolved === "hedera_testnet") {
    const { hederaTestnetProofAdapter } = await import("./adapters/hederaTestnetProofAdapter");
    return hederaTestnetProofAdapter;
  }
  return mockProofAdapter;
}

function getSupabaseAdminClient(): SupabaseClient | null {
  if (typeof window !== "undefined") {
    return null;
  }

  return createSupabaseServiceRoleClient({
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

function normalizeProofStatus(status: ProofAnchorResult["status"]): ProofSummary["status"] {
  if (status === "mock_anchored") return "mock_anchored";
  if (status === "submitted") return "submitted";
  if (status === "confirmed") return "confirmed";
  if (status === "disabled") return "disabled";
  return "failed";
}

async function persistProofResult(packet: EvidencePacket, result: ProofAnchorResult) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return;

  try {
    const record = {
      run_id: packet.runId,
      scenario_id: packet.scenarioId,
      proof_mode: result.proofMode,
      network: result.network,
      evidence_hash: result.evidenceHash,
      evidence_bytes32: result.evidenceBytes32 ?? null,
      anchor_type: packet.mode === "mock" || result.proofMode === "mock" ? "mock" : "chain",
      status: normalizeProofStatus(result.status),
      transaction_hash: result.transactionHash ?? null,
      ledger_index: result.ledgerIndex ?? null,
      block_number: result.blockNumber ?? null,
      contract_address: result.contractAddress ?? null,
      explorer_url: result.explorerUrl ?? null,
      error_message: result.error ?? null,
    };

    await supabase
      .schema("proof")
      .from("anchors")
      .insert(record);
  } catch {
    // Optional persistence only; failures must never break command or anchor flow.
  }
}

export async function listLatestProofSummaries(limit = 5): Promise<ProofSummary[]> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .schema("proof")
      .from("anchors")
      .select(
        "id, run_id, scenario_id, evidence_hash, network, status, explorer_url, transaction_hash, ledger_index, block_number, contract_address, evidence_bytes32, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return data as ProofSummary[];
  } catch {
    return [];
  }
}

export async function anchorEvidence(
  packet: EvidencePacket,
  mode?: ProofMode
): Promise<ProofAnchorResult> {
  const resolvedMode = mode ?? getProofMode();
  if (resolvedMode === "disabled") {
    return {
      proofMode: "disabled",
      network: "none",
      evidenceHash: "",
      evidenceBytes32: "",
      status: "disabled",
    };
  }

  const adapter = await getAdapter(resolvedMode);
  const result = await adapter.anchor(packet);

  await persistProofResult(packet, {
    ...result,
    explorerUrl:
      result.explorerUrl ??
      (result.transactionHash ? getExplorerUrl(result.proofMode, result.transactionHash) : undefined),
  });

  return result;
}

export async function verifyEvidence(
  evidenceHash: string,
  mode?: ProofMode
): Promise<{ verified: boolean; detail: string }> {
  const resolvedMode = mode ?? getProofMode();
  if (resolvedMode === "disabled") {
    return { verified: false, detail: "Proof ledger is disabled." };
  }
  const adapter = await getAdapter(resolvedMode);
  return adapter.verify(evidenceHash);
}

export function getProofReadiness(): ProofReadiness {
  const mode = getProofMode();
  const xrplConfig = {
    ws: Boolean(process.env.XRPL_TESTNET_WS),
    seed: Boolean(process.env.XRPL_ANCHOR_SEED),
    destination: Boolean(process.env.XRPL_PROOF_DESTINATION),
    jsonRpc: Boolean(process.env.XRPL_TESTNET_JSON_RPC),
  };
  const hederaConfig = {
    rpcUrl: Boolean(process.env.HEDERA_EVM_RPC_URL),
    privateKey: Boolean(process.env.HEDERA_EVM_PRIVATE_KEY),
    contractAddress: Boolean(process.env.HEDERA_PROOF_LEDGER_CONTRACT_ADDRESS),
    chainId:
      typeof process.env.HEDERA_EVM_CHAIN_ID === "string" && process.env.HEDERA_EVM_CHAIN_ID.trim().length > 0
        ? process.env.HEDERA_EVM_CHAIN_ID
        : null,
  };
  return {
    mode,
    mockReady: true,
    xrplReady: xrplConfig.ws && xrplConfig.seed && xrplConfig.destination && xrplConfig.jsonRpc,
    hederaReady: hederaConfig.rpcUrl && hederaConfig.privateKey && hederaConfig.contractAddress,
    xrplConfig,
    hederaConfig,
  };
}

export function buildEvidencePacket(data: {
  runId: string;
  scenarioId: string;
  mode: string;
  telemetry: Record<string, unknown>;
  aiRecommendation: string;
  operatorApproval: string;
  commandDispatch: string;
  eventLedger: string;
}): EvidencePacket {
  const hashes = buildPartialHashes({
    telemetry: data.telemetry,
    aiRecommendation: data.aiRecommendation,
    operatorApproval: data.operatorApproval,
    commandDispatch: data.commandDispatch,
    eventLedger: data.eventLedger,
  });

  return {
    runId: data.runId,
    scenarioId: data.scenarioId,
    mode: data.mode,
    createdAt: new Date().toISOString(),
    app: "tsubaki-nakashima-ai",
    module: "iot-maker",
    ...hashes,
  };
}

export function buildEvidenceEventId(prefix: string): string {
  return `${prefix}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
}

export function isEvidencePacketLike(value: unknown): value is EvidencePacket {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<EvidencePacket>;
  return (
    typeof candidate.runId === "string" &&
    candidate.runId.trim().length > 0 &&
    typeof candidate.scenarioId === "string" &&
    candidate.scenarioId.trim().length > 0 &&
    typeof candidate.mode === "string" &&
    candidate.mode.trim().length > 0 &&
    typeof candidate.telemetrySnapshotHash === "string" &&
    typeof candidate.aiRecommendationHash === "string" &&
    typeof candidate.operatorApprovalHash === "string" &&
    typeof candidate.commandDispatchHash === "string" &&
    typeof candidate.eventLedgerHash === "string" &&
    typeof candidate.createdAt === "string" &&
    candidate.app === "tsubaki-nakashima-ai" &&
    candidate.module === "iot-maker"
  );
}
