import type { ReflexTool, ReflexToolCall, ReflexToolRisk } from "@/lib/reflex-agents/types";

const toolRegistry: ReflexTool[] = [
  {
    id: "read_telemetry_snapshot",
    label: "Read telemetry snapshot",
    description: "Retrieve latest deterministic telemetry context for the active scenario.",
    riskLevel: "low",
    requiresApproval: false,
    serverOnly: false,
    enabledInDemo: true,
    enabledInConnectedMode: true,
    inputSchema: {
      type: "object",
      properties: {
        scenarioId: { type: "string" },
      },
      required: ["scenarioId"],
    },
    outputSchema: {
      type: "object",
      properties: {
        telemetryHash: { type: "string" },
        keys: { type: "array" },
      },
    },
  },
  {
    id: "query_supabase_preset",
    label: "Query Supabase preset",
    description: "Read-only Supabase preset evidence without mutating storage.",
    riskLevel: "low",
    requiresApproval: false,
    serverOnly: true,
    enabledInDemo: true,
    enabledInConnectedMode: true,
    inputSchema: { type: "object", properties: { scenarioId: { type: "string" }, limit: { type: "number" } } },
    outputSchema: { type: "object", properties: { rows: { type: "array" } } },
  },
  {
    id: "ask_model_provider",
    label: "Ask model provider",
    description: "Run the selected model provider with bounded prompt intent for analysis.",
    riskLevel: "medium",
    requiresApproval: false,
    serverOnly: true,
    enabledInDemo: true,
    enabledInConnectedMode: true,
    inputSchema: { type: "object", properties: { provider: { type: "string" }, scenarioId: { type: "string" } } },
    outputSchema: { type: "object", properties: { recommendation: { type: "string" }, proposal: { type: "string" } } },
  },
  {
    id: "propose_iot_command",
    label: "Propose IoT command",
    description: "Draft advisory command proposal for operator review.",
    riskLevel: "medium",
    requiresApproval: true,
    serverOnly: true,
    enabledInDemo: true,
    enabledInConnectedMode: true,
    inputSchema: {
      type: "object",
      properties: {
        commandType: { type: "string" },
        rationale: { type: "string" },
      },
    },
    outputSchema: { type: "object", properties: { requiresApproval: { type: "boolean" }, commandId: { type: "string" } } },
  },
  {
    id: "run_safety_eval",
    label: "Run safety eval",
    description: "Evaluate action proposal against policy constraints and hard blocks.",
    riskLevel: "low",
    requiresApproval: false,
    serverOnly: false,
    enabledInDemo: true,
    enabledInConnectedMode: true,
    inputSchema: { type: "object", properties: { action: { type: "object" } } },
    outputSchema: { type: "object", properties: { allowed: { type: "boolean" }, reason: { type: "string" } } },
  },
  {
    id: "request_operator_approval",
    label: "Request operator approval",
    description: "Raise a human approval checkpoint before execution.",
    riskLevel: "low",
    requiresApproval: false,
    serverOnly: true,
    enabledInDemo: true,
    enabledInConnectedMode: true,
    inputSchema: { type: "object", properties: { summary: { type: "string" } } },
    outputSchema: { type: "object", properties: { approved: { type: "boolean" }, decision: { type: "string" } } },
  },
  {
    id: "simulate_iot_dispatch",
    label: "Simulate IoT dispatch",
    description: "Run shadow dispatch simulation; no direct machine control.",
    riskLevel: "medium",
    requiresApproval: true,
    serverOnly: true,
    enabledInDemo: true,
    enabledInConnectedMode: true,
    inputSchema: { type: "object", properties: { commandId: { type: "string" } } },
    outputSchema: { type: "object", properties: { channel: { type: "string" }, status: { type: "string" } } },
  },
  {
    id: "create_evidence_packet",
    label: "Create evidence packet",
    description: "Generate evidence hashes and packet manifest for proof anchoring.",
    riskLevel: "low",
    requiresApproval: false,
    serverOnly: true,
    enabledInDemo: true,
    enabledInConnectedMode: true,
    inputSchema: { type: "object", properties: { scenarioId: { type: "string" }, runId: { type: "string" } } },
    outputSchema: { type: "object", properties: { packet: { type: "object" } } },
  },
  {
    id: "anchor_proof_hash",
    label: "Anchor proof hash",
    description: "Submit packet hash to the configured hash-only proof mode.",
    riskLevel: "medium",
    requiresApproval: false,
    serverOnly: true,
    enabledInDemo: true,
    enabledInConnectedMode: true,
    inputSchema: { type: "object", properties: { network: { type: "string" }, packet: { type: "object" } } },
    outputSchema: { type: "object", properties: { status: { type: "string" } } },
  },
  {
    id: "write_dashboard_log",
    label: "Write dashboard log",
    description: "Write a non-sensitive summary of the run for UI ledgering.",
    riskLevel: "low",
    requiresApproval: false,
    serverOnly: true,
    enabledInDemo: true,
    enabledInConnectedMode: true,
    inputSchema: { type: "object", properties: { runId: { type: "string" }, note: { type: "string" } } },
    outputSchema: { type: "object", properties: { persisted: { type: "boolean" } } },
  },
  {
    id: "propose_improvement",
    label: "Propose improvement",
    description: "Draft bounded improvement proposal based on run signals.",
    riskLevel: "low",
    requiresApproval: false,
    serverOnly: true,
    enabledInDemo: true,
    enabledInConnectedMode: true,
    inputSchema: { type: "object", properties: { runId: { type: "string" }, hints: { type: "array" } } },
    outputSchema: { type: "object", properties: { proposalId: { type: "string" }, status: { type: "string" } } },
  },
  {
    id: "stage_memory_update",
    label: "Stage memory update",
    description: "Prepare a verified-memory record only when evals are clear.",
    riskLevel: "low",
    requiresApproval: true,
    serverOnly: true,
    enabledInDemo: true,
    enabledInConnectedMode: true,
    inputSchema: { type: "object", properties: { runId: { type: "string" }, evidence: { type: "array" } } },
    outputSchema: { type: "object", properties: { ready: { type: "boolean" }, memoryType: { type: "string" } } },
  },
];

export type ReflexToolInputOutput = {
  id: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  status: ReflexToolCall["status"];
  durationMs: number;
};

export function getAllReflexTools(): ReflexTool[] {
  return toolRegistry;
}

export function getReflexTool(id: string): ReflexTool | undefined {
  return toolRegistry.find((tool) => tool.id === id);
}

export function describeToolRisk(level: ReflexToolRisk): string {
  return level === "low"
    ? "Low risk"
    : level === "medium"
      ? "Medium risk"
      : level === "high"
        ? "High risk"
        : "Blocked by policy";
}

