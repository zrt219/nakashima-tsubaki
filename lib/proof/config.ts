import { AnchorConfig, ProofMode } from "./types";

export function getProofConfig(): AnchorConfig {
  // Default to mock if not specified, or disabled
  const mode = (process.env.NEXT_PUBLIC_PROOF_MODE || "mock") as ProofMode;

  return {
    mode,
    xrplSeed: process.env.XRPL_ANCHOR_SEED,
    hederaPrivateKey: process.env.HEDERA_EVM_PRIVATE_KEY,
    hederaAccountId: process.env.HEDERA_ACCOUNT_ID,
    smartContractAddress: process.env.TN_PROOF_CONTRACT_ADDRESS,
  };
}
