// Server-only. Requires: HEDERA_EVM_RPC_URL, HEDERA_EVM_PRIVATE_KEY, HEDERA_PROOF_LEDGER_CONTRACT_ADDRESS
// Anchors only evidence hash packets.

import type { EvidencePacket, ProofAnchorResult, ProofAdapter } from "../types";
import { hashEvidence } from "../hashEvidence";
import { hederaExplorerUrl } from "../explorer";

const PROOF_LEDGER_ABI = [
  "function anchorEvidence(bytes32 runId, bytes32 evidenceHash, bytes32 eventType, string calldata uri) external",
  "function isAnchored(bytes32 evidenceHash) external view returns (bool)",
  "event EvidenceAnchored(bytes32 indexed runId, bytes32 indexed evidenceHash, bytes32 indexed eventType, address anchorer, uint256 timestamp, string uri)",
] as const;

function toBytes32(input: string): string {
  if (!input) {
    return "0x" + "0".repeat(64);
  }
  const hex = input.startsWith("0x") ? input.slice(2) : input;
  return "0x" + hex.replace(/^0+/, "").padStart(64, "0").slice(-64);
}

function missingConfig(missing: string[]): ProofAnchorResult {
  return {
    proofMode: "hedera_testnet",
    network: "hedera_testnet",
    evidenceHash: "",
    evidenceBytes32: "",
    status: "failed",
    error: `Missing: ${missing.join(", ")}`,
  };
}

export const hederaTestnetProofAdapter: ProofAdapter = {
  async anchor(packet: EvidencePacket): Promise<ProofAnchorResult> {
    const rpcUrl = process.env.HEDERA_EVM_RPC_URL;
    const privateKey = process.env.HEDERA_EVM_PRIVATE_KEY;
    const contractAddress = process.env.HEDERA_PROOF_LEDGER_CONTRACT_ADDRESS;
    const expectedChainId = process.env.HEDERA_EVM_CHAIN_ID ?? "296";

    const missing = [];
    if (!rpcUrl) missing.push("HEDERA_EVM_RPC_URL");
    if (!privateKey) missing.push("HEDERA_EVM_PRIVATE_KEY");
    if (!contractAddress) missing.push("HEDERA_PROOF_LEDGER_CONTRACT_ADDRESS");
    if (missing.length > 0) return missingConfig(missing);

    let ethersModule: typeof import("ethers");
    try {
      ethersModule = await import("ethers");
    } catch {
      return {
        proofMode: "hedera_testnet",
        network: "hedera_testnet",
        evidenceHash: "",
        evidenceBytes32: "",
        status: "failed",
        error: "ethers module unavailable.",
      };
    }

    const { sha256Hex, bytes32 } = hashEvidence(packet);
    const { JsonRpcProvider, Wallet, Contract } = ethersModule;

    try {
      const provider = new JsonRpcProvider(rpcUrl!);
      const network = await provider.getNetwork();
      if (Number(network.chainId) !== Number(expectedChainId)) {
        return {
          proofMode: "hedera_testnet",
          network: "hedera_testnet",
          evidenceHash: "",
          evidenceBytes32: "",
          status: "failed",
          error: `Chain mismatch. Expected chainId ${expectedChainId}, got ${network.chainId}.`,
        };
      }

      const signer = new Wallet(privateKey!, provider);
      const contract = new Contract(contractAddress!, PROOF_LEDGER_ABI, signer);

      const runIdBytes32 = toBytes32(Buffer.from(packet.runId, "utf8").toString("hex"));
      const evidenceBytes32 = toBytes32(sha256Hex);
      const eventTypeBytes32 = toBytes32(Buffer.from("iot_maker", "utf8").toString("hex"));
      const uri = `tn-ai://iot-maker/proof/${packet.runId}`;

      const tx = await contract.anchorEvidence(runIdBytes32, evidenceBytes32, eventTypeBytes32, uri);
      const receipt = await tx.wait();

      return {
        proofMode: "hedera_testnet",
        network: "Hedera Testnet (EVM)",
        evidenceHash: sha256Hex,
        evidenceBytes32: bytes32,
        transactionHash: receipt?.hash ?? tx.hash,
        blockNumber: receipt?.blockNumber ? Number(receipt.blockNumber) : undefined,
        contractAddress,
        explorerUrl: hederaExplorerUrl(receipt?.hash ?? tx.hash),
        status: "confirmed",
      };
    } catch (err: unknown) {
      return {
        proofMode: "hedera_testnet",
        network: "Hedera Testnet (EVM)",
        evidenceHash: sha256Hex,
        evidenceBytes32: bytes32,
        contractAddress,
        status: "failed",
        error: err instanceof Error ? err.message : "Unknown Hedera error.",
      };
    }
  },

  async verify(evidenceHash: string): Promise<{ verified: boolean; detail: string }> {
    const rpcUrl = process.env.HEDERA_EVM_RPC_URL;
    const contractAddress = process.env.HEDERA_PROOF_LEDGER_CONTRACT_ADDRESS;

    if (!rpcUrl || !contractAddress) {
      return {
        verified: false,
        detail: "Hedera config missing - cannot verify on-chain.",
      };
    }

    try {
      const { JsonRpcProvider, Contract } = await import("ethers");
      const provider = new JsonRpcProvider(rpcUrl);
      const contract = new Contract(contractAddress, PROOF_LEDGER_ABI, provider);
      const exists: boolean = await contract.isAnchored(toBytes32(evidenceHash));
      return {
        verified: exists,
        detail: exists
          ? `Evidence hash ${evidenceHash.slice(0, 10)}... confirmed on Hedera Testnet.`
          : "Evidence hash not found in TNProofLedger on Hedera Testnet.",
      };
    } catch (err: unknown) {
      return {
        verified: false,
        detail: err instanceof Error ? `Hedera verification error: ${err.message}` : "Unknown Hedera verification error.",
      };
    }
  },
};
