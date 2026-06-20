import { AnchorResult, EvidencePacket, ProofAdapter, AnchorConfig } from "../types";
import { Client, Wallet } from "xrpl";

export class XRPLAdapter implements ProofAdapter {
  private config: AnchorConfig;
  private client: Client;

  constructor(config: AnchorConfig) {
    this.config = config;
    // Connect to XRPL Testnet
    this.client = new Client("wss://s.altnet.rippletest.net:51233");
  }

  async anchor(evidence: EvidencePacket, hash: string, bytes32: string): Promise<AnchorResult> {
    if (!this.config.xrplSeed) {
      throw new Error("XRPL_ANCHOR_SEED is missing for xrpl_testnet mode");
    }

    try {
      await this.client.connect();
      const wallet = Wallet.fromSeed(this.config.xrplSeed);

      // Store the hash in a Memo field of an AccountSet transaction
      // This anchors the data without moving funds
      const tx = await this.client.submitAndWait({
        TransactionType: "AccountSet",
        Account: wallet.address,
        Memos: [
          {
            Memo: {
              MemoType: Buffer.from("TN_EVIDENCE_HASH", "utf8").toString("hex"),
              MemoData: Buffer.from(hash, "utf8").toString("hex"),
            }
          }
        ]
      }, { wallet });

      const txResult = tx.result;
      const txHash = txResult.hash;

      return {
        success: true,
        evidence_hash: hash,
        evidence_bytes32: bytes32,
        transaction_hash: txHash,
        ledger_index: txResult.ledger_index,
        wallet_address: wallet.address,
        explorer_url: `https://testnet.xrpl.org/transactions/${txHash}`,
      };
    } catch (error: any) {
      console.error("[XRPLAdapter] Anchor failed:", error);
      return {
        success: false,
        evidence_hash: hash,
        evidence_bytes32: bytes32,
        error: error.message || "Unknown XRPL error",
      };
    } finally {
      await this.client.disconnect();
    }
  }
}
