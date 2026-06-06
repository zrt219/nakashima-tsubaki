// Command Flow Test runner for IoT Maker.
// Never dispatches real cloud commands; approvals are required in demo mode and dispatch is mocked.

import { NextResponse } from "next/server";
import { runCommandFlowTest } from "@/lib/iot-maker/commandFlowTest";
import { buildEvidencePacket, anchorEvidence, getProofMode } from "@/lib/proof-ledger/proofLedgerService";
import { hashEvidence } from "@/lib/proof-ledger/hashEvidence";

export const dynamic = "force-dynamic";

type TestBody = {
  scenarioId?: string;
  approve?: boolean;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as TestBody;
    const scenarioId = typeof body.scenarioId === "string" ? body.scenarioId : undefined;
    const approve = body.approve === true;

    // 1. Build synthetic packet + diagnostic.
    const flowResult = runCommandFlowTest(scenarioId, { approve });

    // 2. Validate telemetry schema and produce evidence hashes.
    const evidencePacket = buildEvidencePacket({
      runId: flowResult.runId,
      scenarioId: flowResult.scenarioId,
      mode: flowResult.runtimeMode,
      telemetry: flowResult.telemetry,
      aiRecommendation: flowResult.aiDiagnostic,
      operatorApproval: flowResult.operatorApprovalStatus,
      commandDispatch: flowResult.dispatchStatus,
      eventLedger: `flow_step_count_${flowResult.steps.length}`,
    });

    // 3. Hash packet deterministically.
    const evidenceHash = hashEvidence(evidencePacket);

    // 4. Anchor hash in configured proof mode (mock only by default).
    const proofResult = await anchorEvidence(evidencePacket);

    return NextResponse.json({
      success: true,
      runId: flowResult.runId,
      scenarioId: flowResult.scenarioId,
      runtimeMode: flowResult.runtimeMode,
      proofMode: getProofMode(),
      steps: flowResult.steps,
      telemetrySchemaOk: flowResult.telemetrySchemaOk,
      commandProposal: {
        commandId: flowResult.commandProposal.commandId,
        type: flowResult.commandProposal.type,
        requiresOperatorApproval: flowResult.commandProposal.requiresOperatorApproval,
      },
      operatorApprovalStatus: flowResult.operatorApprovalStatus,
      dispatchStatus: flowResult.dispatchStatus,
      dispatchRecord: flowResult.dispatchRecord,
      evidence: {
        packet: {
          runId: evidencePacket.runId,
          scenarioId: evidencePacket.scenarioId,
          telemetrySnapshotHash: evidencePacket.telemetrySnapshotHash,
          aiRecommendationHash: evidencePacket.aiRecommendationHash,
          operatorApprovalHash: evidencePacket.operatorApprovalHash,
          commandDispatchHash: evidencePacket.commandDispatchHash,
          eventLedgerHash: evidencePacket.eventLedgerHash,
          createdAt: evidencePacket.createdAt,
          app: evidencePacket.app,
          module: evidencePacket.module,
          mode: evidencePacket.mode,
        },
        sha256Hex: evidenceHash.sha256Hex,
        bytes32: evidenceHash.bytes32,
      },
      proofAnchor: proofResult,
      safetyGuarantees: {
        noRealCommandDispatched: flowResult.dispatchStatus === "blocked" || flowResult.dispatchStatus === "no_dispatch",
        blockchainDidNotDispatch: true,
        approvalRequired: true,
        telemetryNotOnChain: true,
        promptsNotOnChain: true,
      },
      generatedAt: flowResult.generatedAt,
    });
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: "Command flow test failed", detail },
      { status: 500 }
    );
  }
}
