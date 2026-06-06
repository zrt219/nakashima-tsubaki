// Server-only. Requires: XRPL_TESTNET_WS, XRPL_ANCHOR_SEED, XRPL_PROOF_DESTINATION
// Uses XRPL testnet payment memos to anchor proof hashes only.

import type { EvidencePacket, ProofAnchorResult, ProofAdapter } from "../types";
import { hashEvidence } from "../hashEvidence";
import { xrplExplorerUrl } from "../explorer";

function toHex(input: string): string {
  return Buffer.from(input, "utf8").toString("hex");
}

function buildMemo(packet: EvidencePacket, evidenceHash: string) {
  const memoString = `app=${packet.app}|module=${packet.module}|runId=${packet.runId}|evidenceHash=${evidenceHash}`;
  return {
    MemoType: toHex("proof"),
    MemoFormat: toHex("text/plain"),
    MemoData: toHex(memoString),
  };
}

function blocked(missing: string[]): ProofAnchorResult {
  return {
    proofMode: "xrpl_testnet",
    network: "xrpl_testnet",
    evidenceHash: "",
    evidenceBytes32: "",
    status: "failed",
    error: `Missing: ${missing.join(", ")}`,
  };
}

export const xrplTestnetProofAdapter: ProofAdapter = {
  async anchor(packet: EvidencePacket): Promise<ProofAnchorResult> {
    const wsUrl = process.env.XRPL_TESTNET_WS;
    const seed = process.env.XRPL_ANCHOR_SEED;
    const destination = process.env.XRPL_PROOF_DESTINATION;
    const jsonRpc = process.env.XRPL_TESTNET_JSON_RPC;

    const missing: string[] = [];
    if (!wsUrl) missing.push("XRPL_TESTNET_WS");
    if (!seed) missing.push("XRPL_ANCHOR_SEED");
    if (!destination) missing.push("XRPL_PROOF_DESTINATION");
    if (!jsonRpc) missing.push("XRPL_TESTNET_JSON_RPC");
    if (missing.length > 0) return blocked(missing);

    let xrpl: typeof import("xrpl");
    let activeClient: null | { disconnect: () => Promise<void>; submitAndWait: (tx: unknown) => Promise<unknown>; connect: () => Promise<void> } = null;
    try {
      xrpl = await import("xrpl");
    } catch {
      return {
        proofMode: "xrpl_testnet",
        network: "xrpl_testnet",
        evidenceHash: "",
        evidenceBytes32: "",
        status: "failed",
        error: "XRPL SDK unavailable in this environment.",
      };
    }

    const { sha256Hex, bytes32 } = hashEvidence(packet);
    const memo = buildMemo(packet, sha256Hex);
    if (memo.MemoData.length > 1024) {
      return {
        proofMode: "xrpl_testnet",
        network: "xrpl_testnet",
        evidenceHash: sha256Hex,
        evidenceBytes32: bytes32,
        status: "failed",
        error: "Memo payload exceeds XRPL 1KB constraint.",
      };
    }

    try {
      const { Client, Wallet, xrpToDrops } = xrpl;
      if (!Client || !Wallet || !xrpToDrops) {
        return {
          proofMode: "xrpl_testnet",
          network: "xrpl_testnet",
          evidenceHash: sha256Hex,
          evidenceBytes32: bytes32,
          status: "failed",
          error: "XRPL client API is missing expected exports.",
        };
      }

      const client = new (Client as unknown as new (
        ...args: unknown[]
      ) => { connect: () => Promise<void>; submitAndWait: (tx: unknown) => Promise<unknown>; disconnect: () => Promise<void> })(wsUrl!);
      activeClient = client;
      const wallet = (Wallet as unknown as { fromSeed: (seed: string) => { address: string } }).fromSeed(seed!);

      await client.connect();

      const tx = {
        TransactionType: "Payment",
        Account: wallet.address,
        Destination: destination!,
        Amount: xrpToDrops ? xrpToDrops("0.000001") : "1",
        Memos: [{ Memo: memo }],
      };

      const submitResult = await client.submitAndWait(tx);
      const txHash =
        (submitResult as { result?: { hash?: string; tx_json?: { inLedger?: number } } }).result?.hash ??
        (submitResult as { hash?: string }).hash;
      const ledgerIndex =
        (submitResult as { result?: { ledger_index?: number; tx_json?: { inLedger?: number } } }).result?.ledger_index ??
        (submitResult as { result?: { tx_json?: { inLedger?: number } } }).result?.tx_json?.inLedger ??
        (submitResult as { ledgerIndex?: number }).ledgerIndex;

      return {
        proofMode: "xrpl_testnet",
        network: "xrpl_testnet",
        evidenceHash: sha256Hex,
        evidenceBytes32: bytes32,
        transactionHash: txHash,
        ledgerIndex,
        explorerUrl: txHash ? xrplExplorerUrl(txHash) : undefined,
        status: txHash ? "submitted" : "failed",
        error: txHash ? undefined : "XRPL returned no transaction hash.",
      };
    } catch (error: unknown) {
      return {
        proofMode: "xrpl_testnet",
        network: "xrpl_testnet",
        evidenceHash: sha256Hex,
        evidenceBytes32: bytes32,
        status: "failed",
        error: error instanceof Error ? error.message : "XRPL anchor execution failed.",
      };
    } finally {
      try {
        if (activeClient) {
          await activeClient.disconnect();
        }
      } catch {
        // Best-effort cleanup only.
      }
    }
  },

  async verify(): Promise<{ verified: boolean; detail: string }> {
    return {
      verified: false,
      detail:
        "XRPL memo verification requires external explorer lookup; the anchor result includes an explorer URL for manual inspection.",
    };
  },
};
