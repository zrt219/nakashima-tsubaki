export type ProofMode = "mock" | "xrpl_testnet" | "hedera_testnet" | "disabled";

export interface AnchorConfig {
  mode: ProofMode;
  xrplSeed?: string;
  hederaPrivateKey?: string;
  hederaAccountId?: string;
  smartContractAddress?: string; // e.g. deployed Hedera/EVM address
}

export interface EvidencePacket {
  run_id: string;
  scenario_id: string;
  event_id: string;
  timestamp: string;
  actor: string;
  action_type: string;
  payload: Record<string, any>;
  approval_status: "approved" | "rejected" | "auto_approved";
}

export interface AnchorResult {
  success: boolean;
  evidence_hash: string;
  evidence_bytes32: string;
  transaction_hash?: string;
  ledger_index?: number;
  block_number?: number;
  contract_address?: string;
  wallet_address?: string;
  explorer_url?: string;
  error?: string;
}

export interface ProofAdapter {
  anchor(evidence: EvidencePacket, hash: string, bytes32: string): Promise<AnchorResult>;
  verify?(transactionHash: string, expectedHash: string): Promise<boolean>;
}
