import type { EvidencePacket, ProofAnchorResult } from "@/lib/proof-ledger/types";

export type ReflexAgentRole = "atlas" | "scribe" | "forge" | "sentinel" | "operator";

export type ReflexPhase =
  | "idle"
  | "observing"
  | "diagnosing"
  | "planning"
  | "selecting_tools"
  | "simulating"
  | "evaluating"
  | "approval_required"
  | "approved"
  | "rejected"
  | "dispatching"
  | "capturing_evidence"
  | "anchoring_proof"
  | "reflecting"
  | "proposing_improvement"
  | "memory_update_ready"
  | "complete";

export type ReflexToolRisk = "low" | "medium" | "high" | "blocked";

export type ReflexTool = {
  id: string;
  label: string;
  description: string;
  riskLevel: ReflexToolRisk;
  requiresApproval: boolean;
  serverOnly: boolean;
  enabledInDemo: boolean;
  enabledInConnectedMode: boolean;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
};

export type ReflexToolCallStatus = "pending" | "running" | "completed" | "blocked" | "failed";

export type ReflexToolCall = {
  id: string;
  toolId: string;
  toolLabel: string;
  phase: ReflexPhase;
  agent: ReflexAgentRole;
  startedAt: string;
  completedAt?: string;
  status: ReflexToolCallStatus;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  durationMs: number;
  risk: ReflexToolRisk;
  blockedReason?: string;
};

export type ReflexAgentEvent = {
  id: string;
  runId: string;
  phase: ReflexPhase;
  agent: ReflexAgentRole;
  action: string;
  inputSummary?: string;
  outputSummary?: string;
  startedAt: string;
  completedAt?: string;
  durationMs: number;
  risk: ReflexToolRisk;
  approvalState: "required" | "not_required" | "approved" | "rejected" | "auto_simulation";
  logId?: string;
};

export type ReflexEvalName =
  | "safety_eval"
  | "tool_permission_eval"
  | "evidence_completeness_eval"
  | "operator_gate_eval"
  | "proof_integrity_eval"
  | "no_secret_leak_eval"
  | "no_direct_plc_eval"
  | "tutorial_understanding_eval";

export type ReflexEvalResult = {
  id: string;
  name: ReflexEvalName;
  status: "pass" | "warning" | "fail";
  score: number;
  reason: string;
  blocking: boolean;
};

export type OperatorDecision = {
  status: "approved" | "rejected" | "asked";
  note: string;
  decidedAt: string;
  by: "operator" | "system";
};

export type ReflexImprovementProposal = {
  id: string;
  title: string;
  problemObserved: string;
  proposedChange: string;
  expectedBenefit: string;
  riskLevel: "low" | "medium" | "high";
  requiresHumanApproval: true;
  affectedLayer:
    | "ui"
    | "telemetry"
    | "ai_provider"
    | "iot_dispatch"
    | "proof_ledger"
    | "safety_policy"
    | "tutorial"
    | "source_docs"
    | "evals";
  evalRequired: string[];
  rollbackPlan: string;
  status: "draft" | "approved" | "rejected" | "stored_as_memory";
};

export type ReflexMemoryType = "run_memory" | "decision_memory" | "failure_memory" | "improvement_memory" | "source_memory" | "safety_memory";

export type ReflexMemoryRecord = {
  id: string;
  type: ReflexMemoryType;
  title: string;
  summary: string;
  evidence: string[];
  confidence: number;
  sourceRunId: string;
  createdAt: string;
  status: "pending" | "stored" | "archived";
};

export type ReflexMemoryDecision = {
  approved: boolean;
  actor: "operator" | "system";
  note: string;
  decidedAt: string;
};

export type ReflexRun = {
  id: string;
  scenarioId: string;
  startedAt: string;
  completedAt?: string;
  phase: ReflexPhase;
  agents: ReflexAgentEvent[];
  toolCalls: ReflexToolCall[];
  evals: ReflexEvalResult[];
  operatorDecision?: OperatorDecision;
  evidencePacket?: EvidencePacket;
  proofAnchor?: ProofAnchorResult;
  improvementProposal?: ReflexImprovementProposal;
  memoryUpdate?: ReflexMemoryRecord;
  timeline: { phase: ReflexPhase; label: string; startedAt: string; completedAt?: string }[];
  notes: string[];
};

