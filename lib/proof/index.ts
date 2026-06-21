import { AnchorConfig, AnchorResult, EvidencePacket, ProofAdapter } from "./types";
import { getProofConfig } from "./config";
import { hashEvidence } from "./hasher";
import { MockAdapter } from "./adapters/mock-adapter";
import { XRPLAdapter } from "./adapters/xrpl-adapter";
import { HederaAdapter } from "./adapters/hedera-adapter";

export class ProofLedger {
  private config: AnchorConfig;
  private adapter: ProofAdapter | null;

  constructor() {
    this.config = getProofConfig();
    this.adapter = this.initAdapter();
  }

  private initAdapter(): ProofAdapter | null {
    switch (this.config.mode) {
      case "disabled":
        return null;
      case "mock":
        return new MockAdapter();
      case "xrpl_testnet":
        return new XRPLAdapter(this.config);
      case "hedera_testnet":
        return new HederaAdapter(this.config);
      default:
        console.warn(`[ProofLedger] Unknown mode '${this.config.mode}', falling back to mock`);
        return new MockAdapter();
    }
  }

  async anchorEvent(evidence: EvidencePacket): Promise<AnchorResult> {
    if (this.config.mode === "disabled" || !this.adapter) {
      return {
        success: false,
        evidence_hash: "",
        evidence_bytes32: "",
        error: "Proof Ledger is disabled",
      };
    }

    // 1. Hash the evidence deterministically
    const { hash, bytes32 } = hashEvidence(evidence);

    // 2. Pass to the chosen adapter to anchor
    try {
      return await this.adapter.anchor(evidence, hash, bytes32);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Adapter failed to anchor";
      return {
        success: false,
        evidence_hash: hash,
        evidence_bytes32: bytes32,
        error: errorMessage,
      };
    }
  }
}

// Export singleton instance for easy usage
export const proofLedger = new ProofLedger();
export * from "./types";
