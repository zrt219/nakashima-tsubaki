// lib/iot-maker/safetyPolicy.ts

export const SAFETY_POLICY = {
  requireOperatorApproval: process.env.REQUIRE_OPERATOR_APPROVAL !== "false",
  allowDirectMachineControl: process.env.ALLOW_DIRECT_MACHINE_CONTROL === "true",
  blockchainControlsNothing: true,
  telemetryIsOffChain: true,
  aiPromptsAreOffChain: true,
  commandPayloadsAreOffChain: true,
} as const;

export function assertSafeToDispatch(approved: boolean): void {
  if (!approved) throw new Error("Command requires operator approval.");
  if (SAFETY_POLICY.allowDirectMachineControl) {
    throw new Error("ALLOW_DIRECT_MACHINE_CONTROL is true. Dispatch blocked by safety policy.");
  }
}

export type CapabilityCell = "store" | "hash-only" | "transport" | "approved-only" | "read-only" | "propose" | "approve" | "blocked" | true | false | "approve-or-block";

export type SafetyMatrixRow = {
  capability: string;
  ai: CapabilityCell;
  operator: CapabilityCell;
  edgeBridge: CapabilityCell;
  supabase: CapabilityCell;
  awsIot: CapabilityCell;
  xrpl: CapabilityCell;
  hedera: CapabilityCell;
  system: CapabilityCell;
  systemDescription?: string;
};

export const SAFETY_MATRIX: SafetyMatrixRow[] = [
  { capability: "Read telemetry", ai: "read-only", operator: false, edgeBridge: "transport", supabase: "store", awsIot: "transport", xrpl: false, hedera: false, system: "store", systemDescription: "Operational state, telemetry mirror, and audit logs." },
  { capability: "Propose command", ai: "propose", operator: false, edgeBridge: false, supabase: "store", awsIot: false, xrpl: false, hedera: false, system: false, systemDescription: "Recommendation generation is advisory only." },
  { capability: "Approve command", ai: false, operator: "approve", edgeBridge: false, supabase: "store", awsIot: false, xrpl: false, hedera: false, system: "store", systemDescription: "Operator review produces explicit approval or rejection." },
  { capability: "Dispatch command", ai: false, operator: false, edgeBridge: "approved-only", supabase: false, awsIot: "transport", xrpl: false, hedera: false, system: false, systemDescription: "Edge bridge only emits transport messages after approval." },
  { capability: "Write direct PLC", ai: false, operator: false, edgeBridge: false, supabase: false, awsIot: false, xrpl: false, hedera: false, system: false, systemDescription: "No direct PLC API is exposed in this module." },
  { capability: "Disable approval gate", ai: false, operator: false, edgeBridge: false, supabase: false, awsIot: false, xrpl: false, hedera: false, system: false, systemDescription: "Requires explicit feature flag changes and is denied by default." },
  { capability: "Expose secrets", ai: false, operator: false, edgeBridge: false, supabase: false, awsIot: false, xrpl: false, hedera: false, system: false, systemDescription: "Server-only secrets are never returned to clients." },
  { capability: "Change IoT topics", ai: false, operator: false, edgeBridge: false, supabase: false, awsIot: "transport", xrpl: false, hedera: false, system: false, systemDescription: "Topic changes are deployment-time only." },
  { capability: "Write audit ledger", ai: false, operator: false, edgeBridge: false, supabase: "store", awsIot: false, xrpl: false, hedera: false, system: true, systemDescription: "Safe audit and proof summaries are persisted when server role is available." },
  { capability: "Anchor evidence hash", ai: false, operator: false, edgeBridge: false, supabase: "store", awsIot: false, xrpl: "hash-only", hedera: "hash-only", system: true, systemDescription: "Only packet hashes are anchored." },
  { capability: "Control machine through blockchain", ai: false, operator: false, edgeBridge: false, supabase: false, awsIot: false, xrpl: "blocked", hedera: "blocked", system: false, systemDescription: "Blockchains cannot execute physical machine commands." },
];
