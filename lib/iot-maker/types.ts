// lib/iot-maker/types.ts

export type RuntimeMode = "demo" | "partial" | "connected" | "blocked";

export type ServiceStatus =
  | "ready"
  | "simulated"
  | "missing"
  | "warning"
  | "blocked"
  | "error";

export type ServiceId =
  | "vercel"
  | "supabase"
  | "aws_iot"
  | "gemini"
  | "openai"
  | "browser_ui"
  | "edge_bridge"
  | "operator_gate"
  | "xrpl_testnet"
  | "hedera_testnet"
  | "proof_ledger";

export type ReadinessCheck = {
  id: string;
  service: ServiceId;
  label: string;
  status: ServiceStatus;
  requiredForDemo: boolean;
  requiredForConnected: boolean;
  safeMessage: string;
  secret?: boolean;
};

export type CommissioningTestStep = {
  id: string;
  label: string;
  service: ServiceId;
  status: "pending" | "running" | "passed" | "failed" | "blocked";
  evidence?: string;
  timestamp?: string;
};

export type DemoScenario = {
  id: string;
  name: string;
  description: string;
  telemetryKeys: string[];
};

export type SafetyBoundaryRow = {
  capability: string;
  ai: boolean | "read-only" | "propose";
  operator: boolean | "approve";
  edgeBridge: boolean | "approved-only";
  supabase: boolean | "store";
  awsIot: boolean | "transport";
  xrpl: boolean | "hash-only";
  hedera: boolean | "hash-only";
  system: boolean;
};

export type CommandProposalStatus = "required" | "approved" | "rejected" | "blocked";
export type CommandDispatchStatus =
  | "simulated"
  | "connected_mocked"
  | "blocked"
  | "approved"
  | "no_dispatch";

export type CommandFlowResult = {
  runId: string;
  scenarioId: string;
  scenarioLabel: string;
  runtimeMode: RuntimeMode;
  telemetry: Record<string, unknown>;
  telemetrySchemaOk: boolean;
  aiDiagnostic: string;
  commandProposal: {
    commandId: string;
    type: "inspect_coolant_loop" | "recommend_spindle_adjustment" | "create_quality_hold";
    rationale: string;
    confidence: number;
    requiresOperatorApproval: true;
  };
  operatorApprovalStatus: CommandProposalStatus;
  dispatchStatus: CommandDispatchStatus;
  dispatchRecord?: {
    mode: "demo" | "connected";
    commandType: "inspect_coolant_loop" | "recommend_spindle_adjustment" | "create_quality_hold";
    commandId: string;
    channel: "simulator_bus_mock" | "edge_iot_topic_mock";
    payload: string;
  };
  steps: CommissioningTestStep[];
  generatedAt: string;
};
