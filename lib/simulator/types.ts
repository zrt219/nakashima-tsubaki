import type { StatusKind } from "@/lib/tn-ai-data";

export type TwinModelId =
  | "executive-globe"
  | "roadmap-helix"
  | "rag-knowledge-graph"
  | "simulator-chaotic-spindle"
  | "ledger-blockchain-grid"
  | "advisory-decision-core"
  | "governance-shield"
  | "architecture-lattice"
  | "kpi-telemetry-cylinder"
  | "qa-inspection-torus"
  | "thermal-heat-field"
  | "vibration-wave-tunnel"
  | "tool-wear-geometry"
  | "supply-chain-flow"
  | "operator-approval-orb"
  | "stuxnet-centrifuge";

export type WorkflowStepId =
  | "IDLE"
  | "SCENARIO_SELECTED"
  | "INCIDENT_SEEDED"
  | "SIGNAL_DETECTED"
  | "CONTEXT_RETRIEVED"
  | "RECOMMENDATION_GENERATED"
  | "OPERATOR_REVIEW"
  | "APPROVAL_REQUIRED"
  | "ACTION_APPROVED"
  | "ACTION_REJECTED"
  | "SHADOW_EXECUTION"
  | "OUTCOME_MONITORED"
  | "EVIDENCE_CAPTURED"
  | "REPLAY_READY";

export const WORKFLOW_STEPS: { id: WorkflowStepId; label: string }[] = [
  { id: "IDLE", label: "Idle" },
  { id: "SCENARIO_SELECTED", label: "Scenario Selected" },
  { id: "INCIDENT_SEEDED", label: "Incident Seeded" },
  { id: "SIGNAL_DETECTED", label: "Signal Detected" },
  { id: "CONTEXT_RETRIEVED", label: "Context Retrieved" },
  { id: "RECOMMENDATION_GENERATED", label: "Recommendation Generated" },
  { id: "OPERATOR_REVIEW", label: "Operator Review" },
  { id: "APPROVAL_REQUIRED", label: "Approval Required" },
  { id: "ACTION_APPROVED", label: "Action Approved" },
  { id: "ACTION_REJECTED", label: "Action Rejected" },
  { id: "SHADOW_EXECUTION", label: "Shadow Execution" },
  { id: "OUTCOME_MONITORED", label: "Outcome Monitored" },
  { id: "EVIDENCE_CAPTURED", label: "Evidence Captured" },
  { id: "REPLAY_READY", label: "Replay Ready" }
];

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type ApprovalGate = {
  id: string;
  label: string;
  requiredRole: string;
  reason: string;
  status: ApprovalStatus;
};

export type EvidenceSource = {
  id: string;
  title: string;
  type: "sensor" | "procedure" | "maintenance-log" | "qa-record" | "operator-action" | "simulation";
  confidence: number;
  hash?: string;
};

export type TwinRecommendation = {
  id: string;
  title: string;
  summary: string;
  confidence: number;
  expectedImpact: string;
  safetyMode: "advisory" | "shadow" | "approval-required";
  rationale: string[];
};

export type TwinSignal = {
  id: string;
  label: string;
  unit: string;
  baseline: number;
  current: number;
  threshold: number;
  trend: number[];
  status: "normal" | "watch" | "warning" | "critical";
};

export type TwinScenario = {
  id: string;
  name: string;
  description: string;
  modelId: TwinModelId;
  incidentType: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  signals: TwinSignal[];
  recommendations: TwinRecommendation[];
  evidenceSources: EvidenceSource[];
  requiredApprovals: ApprovalGate[];
};

export type SimulatorEvent = {
  id: string;
  timestamp: string;
  scenarioId: string;
  state: WorkflowStepId;
  actor: "system" | "operator" | "simulator" | "advisor";
  summary: string;
  evidenceHash: string;
};

export type SimulationRun = {
  id: string;
  scenarioId: string;
  createdAt: string;
  updatedAt: string;
  currentStep: WorkflowStepId;
  events: SimulatorEvent[];
  // Snapshot of scenario data as it mutates
  signals: TwinSignal[];
  approvals: ApprovalGate[];
};

export type RunSummary = SimulationRun;
