// lib/proof-ledger/adapters/mockProofAdapter.ts
// No secrets required. Works with zero external dependencies.

import type { EvidencePacket, ProofAnchorResult, ProofAdapter } from "../types";
import { hashEvidence } from "../hashEvidence";

function deterministicFakeTxHash(evidenceHash: string): string {
  return "MOCK" + evidenceHash.slice(0, 60).toUpperCase();
}

function deterministicFakeBlock(evidenceHash: string): number {
  return parseInt(evidenceHash.slice(0, 8), 16) % 10_000_000;
}

export const mockProofAdapter: ProofAdapter = {
  async anchor(packet: EvidencePacket): Promise<ProofAnchorResult> {
    const { sha256Hex, bytes32 } = hashEvidence(packet);
    const fakeTx = deterministicFakeTxHash(sha256Hex);
    const fakeBlock = deterministicFakeBlock(sha256Hex);

    return {
      proofMode: "mock",
      network: "mock",
      evidenceHash: sha256Hex,
      evidenceBytes32: bytes32,
      transactionHash: fakeTx,
      blockNumber: fakeBlock,
      status: "mock_anchored",
    };
  },

  async verify(evidenceHash: string): Promise<{ verified: boolean; detail: string }> {
    if (!evidenceHash || evidenceHash.length < 8) {
      return { verified: false, detail: "Mock verification requires a valid evidence hash." };
    }
    const fakeTx = deterministicFakeTxHash(evidenceHash);
    return {
      verified: true,
      detail: `Mock verification OK. Deterministic tx: ${fakeTx.slice(0, 20)}...`,
    };
  },
};
