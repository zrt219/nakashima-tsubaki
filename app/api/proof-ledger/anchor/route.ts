import { NextResponse } from "next/server";
import type { EvidencePacket, ProofMode } from "@/lib/proof-ledger/types";
import {
  anchorEvidence,
  buildEvidencePacket,
  getProofMode,
  isEvidencePacketLike,
} from "@/lib/proof-ledger/proofLedgerService";

export const dynamic = "force-dynamic";

type AnchorPayload = {
  mode?: ProofMode;
  evidencePacket?: Partial<EvidencePacket> & {
    telemetrySnapshotHash?: string;
    aiRecommendationHash?: string;
    operatorApprovalHash?: string;
    commandDispatchHash?: string;
    eventLedgerHash?: string;
  };
  runId?: string;
  scenarioId?: string;
  telemetry?: Record<string, unknown>;
  aiRecommendation?: string;
  operatorApproval?: string;
  commandDispatch?: string;
  eventLedger?: string;
};

function safeMode(raw: unknown): ProofMode {
  if (raw === "xrpl_testnet" || raw === "hedera_testnet" || raw === "disabled") {
    return raw;
  }
  return "mock";
}

type PacketSourceError = {
  code: "missing_packet" | "missing_hash_fields";
  message: string;
};

function buildEvidencePacketFromPayload(payload: AnchorPayload): EvidencePacket {
  const {
    evidencePacket,
    runId,
    scenarioId,
    telemetry,
    aiRecommendation,
    operatorApproval,
    commandDispatch,
    eventLedger,
  } = payload;

  if (isEvidencePacketLike(evidencePacket)) {
    return {
      ...evidencePacket,
      runId: evidencePacket.runId,
      scenarioId: evidencePacket.scenarioId,
      mode: evidencePacket.mode,
      telemetrySnapshotHash: evidencePacket.telemetrySnapshotHash,
      aiRecommendationHash: evidencePacket.aiRecommendationHash,
      operatorApprovalHash: evidencePacket.operatorApprovalHash,
      commandDispatchHash: evidencePacket.commandDispatchHash,
      eventLedgerHash: evidencePacket.eventLedgerHash,
      createdAt: evidencePacket.createdAt,
      app: evidencePacket.app,
      module: evidencePacket.module,
    };
  }

  const hasHashLikePayload =
    !!evidencePacket &&
    typeof evidencePacket.telemetrySnapshotHash === "string" &&
    typeof evidencePacket.aiRecommendationHash === "string" &&
    typeof evidencePacket.operatorApprovalHash === "string" &&
    typeof evidencePacket.commandDispatchHash === "string" &&
    typeof evidencePacket.eventLedgerHash === "string";

  if (hasHashLikePayload) {
    return {
      runId: evidencePacket?.runId || runId || "iot-run",
      scenarioId: evidencePacket?.scenarioId || scenarioId || "unknown",
      mode: evidencePacket?.mode || "mock",
      telemetrySnapshotHash: evidencePacket.telemetrySnapshotHash!,
      aiRecommendationHash: evidencePacket.aiRecommendationHash!,
      operatorApprovalHash: evidencePacket.operatorApprovalHash!,
      commandDispatchHash: evidencePacket.commandDispatchHash!,
      eventLedgerHash: evidencePacket.eventLedgerHash!,
      createdAt: evidencePacket.createdAt || new Date().toISOString(),
      app: "tsubaki-nakashima-ai",
      module: "iot-maker",
    };
  }

  if (!runId || !scenarioId || !telemetry || aiRecommendation === undefined || operatorApproval === undefined || commandDispatch === undefined || eventLedger === undefined) {
    throw {
      code: "missing_packet",
      message: "Missing evidence packet or enough evidence fragments to rebuild packet.",
    } satisfies PacketSourceError;
  }

  return buildEvidencePacket({
    runId,
    scenarioId,
    mode: evidencePacket?.mode || "mock",
    telemetry,
    aiRecommendation,
    operatorApproval,
    commandDispatch,
    eventLedger,
  });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as AnchorPayload;
    const requestedMode = safeMode(body.mode);
    const proofMode = requestedMode || getProofMode();

    let packet: EvidencePacket;
    try {
      packet = buildEvidencePacketFromPayload(body);
    } catch (error: unknown) {
      const reason = error instanceof Error ? error.message : "Missing hash fields or enough data to anchor evidence.";
      return NextResponse.json(
        {
          success: false,
          error: "Invalid evidence payload",
          detail: reason,
        },
        { status: 400 }
      );
    }

    const proof = await anchorEvidence(packet, proofMode);

    return NextResponse.json({
      success: true,
      requestedMode,
      packet: {
        runId: packet.runId,
        scenarioId: packet.scenarioId,
        mode: packet.mode,
        evidenceHash: proof.evidenceHash,
        evidenceBytes32: proof.evidenceBytes32,
      },
      proof,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : "Unknown error while anchoring proof packet.";
    return NextResponse.json({ success: false, error: "Anchor failed", detail }, { status: 400 });
  }
}
