import { AnchorResult, EvidencePacket, ProofAdapter, AnchorConfig } from "../types";
import { ethers } from "ethers";

// A minimal ABI for the TNProofLedger smart contract
const TNProofLedgerABI = [
  "function anchorEvidence(bytes32 runId, bytes32 evidenceHash, bytes32 eventType, string calldata uri) external",
  "event EvidenceAnchored(bytes32 indexed runId, bytes32 indexed evidenceHash, bytes32 indexed eventType, address anchorer, uint256 timestamp, string uri)"
];

export class HederaAdapter implements ProofAdapter {
  private config: AnchorConfig;

  constructor(config: AnchorConfig) {
    this.config = config;
  }

  async anchor(evidence: EvidencePacket, hash: string, bytes32: string): Promise<AnchorResult> {
    if (!this.config.hederaPrivateKey || !this.config.smartContractAddress) {
      throw new Error("HEDERA_EVM_PRIVATE_KEY or TN_PROOF_CONTRACT_ADDRESS is missing for hedera_testnet mode");
    }

    try {
      // Connect to Hedera Testnet via JSON-RPC
      const provider = new ethers.JsonRpcProvider("https://testnet.hashio.io/api");
      const wallet = new ethers.Wallet(this.config.hederaPrivateKey, provider);

      const contract = new ethers.Contract(
        this.config.smartContractAddress,
        TNProofLedgerABI,
        wallet
      );

      // Convert UUID string to bytes32
      const runIdBytes32 = ethers.id(evidence.run_id);
      const eventTypeBytes32 = ethers.id(evidence.action_type);

      // Call the anchorEvidence function on the smart contract
      const tx = await contract.anchorEvidence(runIdBytes32, bytes32, eventTypeBytes32, "");
      const receipt = await tx.wait();

      return {
        success: true,
        evidence_hash: hash,
        evidence_bytes32: bytes32,
        transaction_hash: receipt.hash,
        block_number: receipt.blockNumber,
        contract_address: this.config.smartContractAddress,
        wallet_address: wallet.address,
        explorer_url: `https://hashscan.io/testnet/transaction/${receipt.hash}`,
      };
    } catch (error: any) {
      console.error("[HederaAdapter] Anchor failed:", error);
      return {
        success: false,
        evidence_hash: hash,
        evidence_bytes32: bytes32,
        error: error.message || "Unknown Hedera error",
      };
    }
  }
}
