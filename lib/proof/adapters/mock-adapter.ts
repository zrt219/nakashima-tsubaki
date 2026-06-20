import { AnchorResult, EvidencePacket, ProofAdapter } from "../types";

export class MockAdapter implements ProofAdapter {
  async anchor(evidence: EvidencePacket, hash: string, bytes32: string): Promise<AnchorResult> {
    console.log("[MockAdapter] Anchoring evidence:", hash);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const mockTxHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    
    return {
      success: true,
      evidence_hash: hash,
      evidence_bytes32: bytes32,
      transaction_hash: mockTxHash,
      ledger_index: Math.floor(Math.random() * 10000000),
      explorer_url: `https://mock.explorer.testnet/tx/${mockTxHash}`,
    };
  }
}
