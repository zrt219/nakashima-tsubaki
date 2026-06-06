import { NextResponse } from "next/server";
import { getProofReadiness, listLatestProofSummaries } from "@/lib/proof-ledger/proofLedgerService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const proofReadiness = getProofReadiness();
    const latest = await listLatestProofSummaries(8);

    return NextResponse.json({
      mode: proofReadiness.mode,
      networks: {
        mock: {
          ready: true,
          description: "Deterministic mock anchor. No secrets required."
        },
        xrpl_testnet: {
          ready: proofReadiness.xrplReady,
          config: proofReadiness.xrplConfig,
          description: "XRPL Testnet memo anchor via Payment tx."
        },
        hedera_testnet: {
          ready: proofReadiness.hederaReady,
          config: proofReadiness.hederaConfig,
          description: "Hedera EVM testnet smart-contract anchor. Chain ID 296."
        },
        disabled: {
          ready: proofReadiness.mode === "disabled",
          description: "Proof mode disabled."
        }
      },
      latestProof: latest.map((row) => ({
        id: row.id,
        runId: row.run_id,
        scenarioId: row.scenario_id,
        network: row.network,
        evidenceHash: row.evidence_hash,
        transactionHash: row.transaction_hash,
        ledgerIndex: row.ledger_index,
        blockNumber: row.block_number,
        explorerUrl: row.explorer_url,
        evidenceBytes32: row.evidence_bytes32,
        status: row.status,
        createdAt: row.created_at,
      })),
      safetyNote: "Only evidence-packet hashes are anchored. Operational data remains off-chain.",
      generatedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: detail }, { status: 500 });
  }
}
