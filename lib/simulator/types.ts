export type TwinModelId =
  | "executive-fleet-globe"
  | "roadmap-dna-helix"
  | "rag-neural-knowledge-graph"
  | "simulator-chaotic-spindle"
  | "ledger-blockchain-cube-grid"
  | "advisory-icosahedron-core"
  | "governance-protective-shield"
  | "architecture-layered-lattice"
  | "kpi-rose-telemetry-cylinder"
  | "qa-inspection-torus"
  | "thermal-heat-field-reactor"
  | "vibration-resonance-tunnel"
  | "tool-wear-eroding-edge"
  | "supply-chain-flow-network"
  | "operator-approval-gate-orb";

export type SimulatorState =
  | "IDLE"
  | "SCENARIO_SELECTED"
  | "INCIDENT_READY"
  | "INCIDENT_SEEDED"
  | "SIGNAL_DETECTED"
  | "SIGNAL_ANALYZED"
  | "CONTEXT_RETRIEVING"
  | "CONTEXT_RETRIEVED"
  | "MISSING_CONTEXT_FLAGGED"
  | "RECOMMENDATION_GENERATING"
  | "RECOMMENDATION_GENERATED"
  | "OPERATOR_REVIEW"
  | "APPROVAL_REQUIRED"
  | "ACTION_APPROVED"
  | "ACTION_REJECTED"
  | "MORE_CONTEXT_REQUESTED"
  | "SHADOW_EXECUTION_READY"
  | "SHADOW_EXECUTION_RUNNING"
  | "SHADOW_EXECUTION_COMPLETED"
  | "OUTCOME_MONITORED"
  | "KPI_IMPACT_MODELED"
  | "EVIDENCE_CAPTURED"
  | "QA_PACKET_GENERATED"
  | "REPLAY_READY"
  | "RUN_COMPLETE"
  | "RESET";

export type SimulatorEventType =
  | "scenario_selected"
  | "incident_seeded"
  | "signal_detected"
  | "signal_analyzed"
  | "context_retrieval_started"
  | "context_retrieved"
  | "missing_context_flagged"
  | "recommendation_generated"
  | "approval_requested"
  | "operator_approved"
  | "operator_rejected"
  | "more_context_requested"
  | "shadow_execution_started"
  | "shadow_execution_completed"
  | "kpi_impact_modeled"
  | "qa_packet_generated"
  | "evidence_captured"
  | "replay_saved"
  | "tutorial_started"
  | "tutorial_step_completed"
  | "tutorial_skipped"
  | "tutorial_completed"
  | "simulator_reset";

export type SimulatorEvent = {
  id: string;
  timestamp: string;
  scenarioId: string;
  runId: string;
  state: SimulatorState;
  type: SimulatorEventType;
  actor: "system" | "operator" | "simulator" | "advisor" | "governance" | "rag" | "qa";
  severity: "info" | "success" | "warning" | "critical";
  summary: string;
  details?: string;
  evidenceHash: string;
  linkedSignalIds?: string[];
  linkedEvidenceIds?: string[];
  linkedRecommendationIds?: string[];
};

export type SignalState = "normal" | "watch" | "warning" | "critical";

export type TwinSignalDefinition = {
  id: string;
  name: string;
  unit: string;
  baseline: number;
  watchThreshold: number;
  warningThreshold: number;
  criticalThreshold: number;
  noiseAmplitude: number;
  rampRate: number;
  incidentMagnitude: number;
};

export type KpiSnapshot = {
  oee: number;
  cpk: number;
  scrapRisk: number;
  fpy: number;
  uptime: number;
};

export type OperatorDecision = "approve" | "reject" | "request-context" | "defer" | "qa-hold" | "evidence-only";

export type ReplayPacket = {
  id: string;
  runId: string;
  scenarioId: string;
  title: string;
  createdAt: string;
  finalState: SimulatorState;
  outcome: "resolved" | "monitored" | "blocked" | "rejected" | "needs-context";
  durationSeconds: number;
  eventCount: number;
  evidenceCount: number;
  approvalDecisions: OperatorDecision[];
  kpiBefore: KpiSnapshot;
  kpiAfter?: KpiSnapshot;
  summary: string;
  localEvidenceHash: string;
};

export type EvidenceSource = {
  id: string;
  title: string;
  type: "document" | "procedure" | "policy" | "log";
  summary: string;
  appliesToScenarios: string[];
  confidence: number;
  approved: boolean;
  lastUpdated: string;
  simulatedHash: string;
};

export type RecommendationDefinition = {
  id: string;
  text: string;
  rationale: string;
  confidence: number;
  requiresApproval: boolean;
  shadowActionAvailable: boolean;
};

export type TwinScenarioDefinition = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  category:
    | "thermal"
    | "vibration"
    | "tooling"
    | "quality"
    | "rag"
    | "sensor"
    | "security"
    | "energy"
    | "provenance"
    | "compound";
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  modelIds: TwinModelId[];
  beginnerSummary: string;
  technicalSummary: string;
  incidentSeed: { name: string; description: string; delaySeconds: number };
  signals: TwinSignalDefinition[];
  evidencePlan: EvidenceSource[];
  recommendations: RecommendationDefinition[];
  // Tutorial highlights optional per scenario
  tutorialHints?: { target: string; message: string }[];
};
