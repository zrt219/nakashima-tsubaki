import { NextResponse } from "next/server";
import { getProofMode, verifyEvidence } from "@/lib/proof-ledger/proofLedgerService";
import type { ProofMode } from "@/lib/proof-ledger/types";

export const dynamic = "force-dynamic";

type VerifyPayload = {
  mode?: ProofMode;
  evidenceHash?: string;
};

function safeMode(raw: unknown): ProofMode {
  if (raw === "xrpl_testnet" || raw === "hedera_testnet" || raw === "disabled") {
    return raw;
  }
  return getProofMode();
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as VerifyPayload;
    const evidenceHash = body.evidenceHash?.trim();

    if (!evidenceHash) {
      return NextResponse.json({ verified: false, error: "evidenceHash is required." }, { status: 400 });
    }

    const resolvedMode = safeMode(body.mode);
    const result = await verifyEvidence(evidenceHash, resolvedMode);

    return NextResponse.json(result);
  } catch (error: unknown) {
    return NextResponse.json(
      { verified: false, detail: error instanceof Error ? error.message : "Unknown verification error." },
      { status: 400 }
    );
  }
}
