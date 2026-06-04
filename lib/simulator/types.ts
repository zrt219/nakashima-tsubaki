import type { StatusKind } from "@/lib/tn-ai-data";

export type VibrationBand = "nominal" | "elevated" | "critical";
export type TemperatureBand = "nominal" | "elevated" | "critical";
export type SurfaceFinishStatus = "nominal" | "drift" | "breach";
export type SampleExpansion = "not_required" | "recommended" | "required";
export type RiskLevel = "stable" | "watch" | "critical";
export type ScenarioTemplateId = "quality_hold" | "thermal_excursion" | "spindle_degradation";
export type WorkflowStepId = "detect" | "retrieve" | "review" | "record" | "complete";
export type ApprovalVerdict = "approve" | "reject" | "escalate";
export type RunDisposition = "monitor" | "hold" | "controlled_release" | "engineering_board";
export type TwinPhaseId =
  | "baseline"
  | "anomaly"
  | "containment"
  | "retrieval"
  | "review_gate"
  | "decision"
  | "evidence";

export type ScenarioInput = {
  scenarioTemplateId?: ScenarioTemplateId;
  lotId: string;
  facilityId?: string;
  lineId: string;
  machineId?: string;
  vibrationBand: VibrationBand;
  temperatureBand: TemperatureBand;
  cpk: number;
  surfaceFinishStatus: SurfaceFinishStatus;
  sampleExpansion: SampleExpansion;
  operatorShift: "day" | "swing" | "night";
  qualityPriority: "throughput" | "balanced" | "containment";
};

export type KnowledgeDocument = {
  id: string;
  title: string;
  owner: string;
  type: string;
  snippet: string;
  tags: string[];
  control: string;
  scenarioTemplates?: ScenarioTemplateId[];
};

export type RetrievedDocument = KnowledgeDocument & {
  confidence: number;
  relevance: number;
  matchedTerms: string[];
};

export type Recommendation = {
  summary: string;
  actions: string[];
  lotDisposition: RunDisposition;
  requiredApprovals: string[];
  confidence: number;
  missingContext: string[];
};

export type SimulationEvent = {
  id: string;
  timestamp: string;
  source: string;
  event: string;
  payload: string;
  status: StatusKind;
};

export type TwinNode = {
  id: string;
  label: string;
  state: string;
  metric: string;
  status: StatusKind;
  x: number;
  y: number;
  detail?: string;
};

export type TwinTelemetry = {
  label: string;
  value: string;
  trend: string;
  detail: string;
  status: StatusKind;
};

export type TwinSubsystemState = {
  id: string;
  label: string;
  state: string;
  detail: string;
  status: StatusKind;
};

export type ShadowWriteback = {
  system: string;
  action: string;
  mode: "blocked" | "staged" | "armed" | "recorded";
  detail: string;
  status: StatusKind;
};

export type TwinFrame = {
  index: number;
  id: TwinPhaseId;
  label: string;
  timestamp: string;
  narrative: string;
  gatingState: string;
  mode: "observed" | "forecast";
  status: StatusKind;
  riskLevel: RiskLevel;
  nodes: TwinNode[];
  telemetry: TwinTelemetry[];
  subsystems: TwinSubsystemState[];
  writebacks: ShadowWriteback[];
  alerts: string[];
};

export type TwinAssetNode = {
  id: string;
  label: string;
  kind: "facility" | "line" | "cell" | "machine" | "lab" | "lot" | "system";
  parentId: string | null;
  state: string;
  metric: string;
  detail: string;
  status: StatusKind;
};

export type ScenarioTemplate = {
  id: ScenarioTemplateId;
  title: string;
  subtitle: string;
  detail: string;
  focusArea: string;
  controlBoundary: string;
  operatorRole: string;
  presetInput: ScenarioInput;
};

export type ApprovalDecision = {
  verdict: ApprovalVerdict;
  reviewer: string;
  note: string;
  decidedAt: string;
};

export type EvidencePacket = {
  hash: string;
  generatedAt: string;
  packetId: string;
  summary: string;
  categories: string[];
  payload: {
    runId: string;
    disposition: RunDisposition;
    recommendation: Recommendation;
    approval: ApprovalDecision | null;
    eventIds: string[];
  };
};

export type RiskAssessment = {
  score: number;
  riskLevel: RiskLevel;
  rationale: string[];
  kpiImpact: {
    retrievalCoverage: number;
    riskStates: number;
    estimatedScrapDelta: number;
    evidenceCount: number;
  };
};

export type SimulationRun = {
  id: string;
  scenarioName: string;
  createdAt: string;
  updatedAt: string;
  currentStep: WorkflowStepId;
  scenarioInput: ScenarioInput;
  query: string;
  risk: RiskAssessment;
  recommendation: Recommendation;
  decision: ApprovalDecision | null;
  evidencePacket: EvidencePacket | null;
  twinNodes: TwinNode[];
  retrievedDocuments: RetrievedDocument[];
  events: SimulationEvent[];
};

export type RunSummary = Pick<
  SimulationRun,
  "id" | "scenarioName" | "createdAt" | "updatedAt" | "currentStep" | "risk" | "decision"
> & {
  lotId: string;
  lineId: string;
};

export type WorkflowAction =
  | { type: "advance_detect" }
  | { type: "advance_retrieve" }
  | { type: "review"; verdict: ApprovalVerdict; reviewer: string; note: string }
  | { type: "generate_evidence" };
