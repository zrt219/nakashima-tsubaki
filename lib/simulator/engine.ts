import type { StatusKind } from "@/lib/tn-ai-data";
import { getScenarioTemplateById, twinKnowledgeCorpus } from "@/lib/simulator/seed-data";
import type {
  ApprovalVerdict,
  EvidencePacket,
  RiskAssessment,
  RunDisposition,
  ScenarioInput,
  ShadowWriteback,
  SimulationEvent,
  SimulationRun,
  TwinAssetNode,
  TwinFrame,
  TwinNode,
  TwinPhaseId,
  TwinSubsystemState,
  TwinTelemetry,
  WorkflowAction,
  WorkflowStepId
} from "@/lib/simulator/types";

const BASE_TIME = "2026-06-03T08:14:00.000Z";
const stepToTwinFrameIndex: Record<WorkflowStepId, number> = {
  detect: 2,
  retrieve: 3,
  review: 4,
  record: 5,
  complete: 6
};
const vibrationBands = {
  nominal: 0.41,
  elevated: 0.72,
  critical: 0.91
} as const;
const temperatureBands = {
  nominal: 46,
  elevated: 53,
  critical: 61
} as const;
const genealogyCoverageByExpansion = {
  not_required: 42,
  recommended: 76,
  required: 100
} as const;
const twinFrameDefinitions: Array<{
  id: TwinPhaseId;
  minuteOffset: number;
  label: string;
}> = [
  { id: "baseline", minuteOffset: -4, label: "Nominal baseline" },
  { id: "anomaly", minuteOffset: 0, label: "Edge anomaly detected" },
  { id: "containment", minuteOffset: 2, label: "Containment latched" },
  { id: "retrieval", minuteOffset: 5, label: "Knowledge retrieval attached" },
  { id: "review_gate", minuteOffset: 11, label: "Operator review gate" },
  { id: "decision", minuteOffset: 16, label: "Decision path committed" },
  { id: "evidence", minuteOffset: 21, label: "Evidence anchor closed" }
];

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;
}

function resolveScenarioInput(input: ScenarioInput): ScenarioInput {
  return {
    ...getScenarioTemplateById(input.scenarioTemplateId).presetInput,
    ...input
  };
}

function getScenarioTemplate(input: ScenarioInput) {
  return getScenarioTemplateById(resolveScenarioInput(input).scenarioTemplateId);
}

export function getScenarioTemplateProfile(input: ScenarioInput) {
  return getScenarioTemplate(input);
}

function formatClock(isoTimestamp: string) {
  const date = new Date(isoTimestamp);
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function stepStatus(step: WorkflowStepId, currentStep: WorkflowStepId): StatusKind {
  const order: WorkflowStepId[] = ["detect", "retrieve", "review", "record", "complete"];
  const currentIndex = order.indexOf(currentStep);
  const stepIndex = order.indexOf(step);
  if (stepIndex < currentIndex) {
    return "ready";
  }
  if (stepIndex === currentIndex) {
    if (step === "review") {
      return "approval";
    }
    if (step === "record") {
      return "testnet";
    }
    return "simulated";
  }
  if (step === "review") {
    return "approval";
  }
  if (step === "record") {
    return "locked";
  }
  return "locked";
}

export function assessScenarioRisk(input: ScenarioInput): RiskAssessment {
  const scenarioInput = resolveScenarioInput(input);
  const scenarioId = getScenarioTemplate(scenarioInput).id;
  let score = 0;
  const rationale: string[] = [];

  if (scenarioInput.vibrationBand === "elevated") {
    score += scenarioId === "spindle_degradation" ? 3 : scenarioId === "thermal_excursion" ? 1 : 2;
    rationale.push(
      scenarioId === "spindle_degradation"
        ? "Persistent spindle vibration drift is degrading machine health."
        : "Spindle vibration crossed the advisory band."
    );
  }
  if (scenarioInput.vibrationBand === "critical") {
    score += scenarioId === "spindle_degradation" ? 5 : scenarioId === "thermal_excursion" ? 2 : 4;
    rationale.push(
      scenarioId === "spindle_degradation"
        ? "Spindle vibration is in the critical reliability band."
        : "Spindle vibration reached the critical band."
    );
  }

  if (scenarioInput.temperatureBand === "elevated") {
    score += scenarioId === "thermal_excursion" ? 3 : 1;
    rationale.push(
      scenarioId === "thermal_excursion"
        ? "Coolant loop temperature crossed the warning guardrail."
        : "Temperature drift increases process instability."
    );
  }
  if (scenarioInput.temperatureBand === "critical") {
    score += scenarioId === "thermal_excursion" ? 5 : 3;
    rationale.push(
      scenarioId === "thermal_excursion"
        ? "Coolant loop temperature entered the critical thermal band."
        : "Temperature entered the critical band."
    );
  }

  if (scenarioInput.cpk < 1.0) {
    score += 4;
    rationale.push("Cpk is below 1.0 and indicates immediate capability risk.");
  } else if (scenarioInput.cpk < 1.33) {
    score += 2;
    rationale.push("Cpk is below the preferred release threshold.");
  }

  if (scenarioInput.surfaceFinishStatus === "drift") {
    score += scenarioId === "thermal_excursion" ? 1 : 2;
    rationale.push(
      scenarioId === "thermal_excursion"
        ? "Thermal drift is beginning to affect downstream surface performance."
        : "Surface finish drift requires verification before release."
    );
  }
  if (scenarioInput.surfaceFinishStatus === "breach") {
    score += scenarioId === "thermal_excursion" ? 3 : 4;
    rationale.push("Surface finish breach requires hard containment.");
  }

  if (scenarioInput.sampleExpansion === "recommended") {
    score += 1;
    rationale.push("Expanded sampling has been suggested.");
  }
  if (scenarioInput.sampleExpansion === "required") {
    score += 2;
    rationale.push("Expanded sampling is required.");
  }

  let riskLevel: RiskAssessment["riskLevel"] = "stable";
  if (score >= 9) {
    riskLevel = "critical";
  } else if (score >= 5) {
    riskLevel = "watch";
  }

  return {
    score,
    riskLevel,
    rationale,
    kpiImpact: {
      retrievalCoverage: scenarioId === "thermal_excursion" ? 79 : scenarioId === "spindle_degradation" ? 84 : 82,
      riskStates: riskLevel === "critical" ? 4 : riskLevel === "watch" ? 3 : 2,
      estimatedScrapDelta:
        scenarioId === "thermal_excursion"
          ? riskLevel === "critical"
            ? 1.9
            : riskLevel === "watch"
              ? 0.9
              : 0.3
          : riskLevel === "critical"
            ? 2.3
            : riskLevel === "watch"
              ? 1.2
              : 0.4,
      evidenceCount: riskLevel === "critical" ? 5 : 4
    }
  };
}

function getDisposition(riskLevel: RiskAssessment["riskLevel"]): RunDisposition {
  if (riskLevel === "critical") {
    return "hold";
  }
  if (riskLevel === "watch") {
    return "hold";
  }
  return "monitor";
}

export function buildRecommendation(input: ScenarioInput, risk: RiskAssessment) {
  const scenarioInput = resolveScenarioInput(input);
  const template = getScenarioTemplate(scenarioInput);
  const lotDisposition = getDisposition(risk.riskLevel);
  const actions =
    template.id === "thermal_excursion"
      ? [
          "Shadow-protect the affected route and adjacent thermal capacity buffer.",
          "Attach approved thermal protection guidance to the operator review package.",
          "Require production and process review before any simulated reroute or release."
        ]
      : template.id === "spindle_degradation"
        ? [
            "Stage a condition-based spindle inspection packet and attach vibration trend context.",
            "Expand inspection on the active lot and adjacent genealogy before any release recommendation.",
            "Require reliability and quality review before any simulated writeback."
          ]
        : [
            "Expand inspection coverage on the active lot and adjacent genealogy.",
            "Attach approved source trace to the quality-hold recommendation.",
            "Require operator and quality review before any simulated writeback."
          ];

  if (scenarioInput.vibrationBand !== "nominal") {
    actions.splice(
      1,
      0,
      template.id === "thermal_excursion"
        ? "Review spindle load alongside coolant thermal history to rule out coupled instability."
        : "Schedule spindle inspection and verify maintenance threshold history."
    );
  }

  if (scenarioInput.temperatureBand !== "nominal" && template.id === "thermal_excursion") {
    actions.push("Shadow-stage route protection on the adjacent cell until thermal stability is restored.");
  }

  if (scenarioInput.cpk < 1.33) {
    actions.push(
      template.id === "spindle_degradation"
        ? "Escalate capability loss to reliability engineering and manufacturing engineering."
        : "Escalate process parameter review to manufacturing engineering."
    );
  }

  const missingContext =
    template.id === "thermal_excursion"
      ? [
          "No live coolant loop historian is connected in this local simulator.",
          "No real route protection or line balancing writeback occurs in demo mode."
        ]
      : template.id === "spindle_degradation"
        ? [
            "No live bearing wear model or balancing system is connected in this local simulator.",
            "No CMMS or QMS writeback occurs in demo mode."
          ]
        : [
            "No live spindle trend history is connected in this local simulator.",
            "No MES or QMS writeback occurs in demo mode."
          ];

  return {
    summary:
      template.id === "thermal_excursion"
        ? lotDisposition === "hold"
          ? "Shadow-protect the route, review the thermal excursion, and hold release pending evidence-backed approval."
          : "Monitor the thermal state with controlled release gates and evidence trace."
        : template.id === "spindle_degradation"
          ? lotDisposition === "hold"
            ? "Contain the affected lot, stage spindle maintenance, and hold release pending reliability review."
            : "Monitor degradation with controlled release gates and condition-based maintenance trace."
          : lotDisposition === "hold"
            ? "Contain the lot, expand sampling, and hold release pending reviewed evidence."
            : "Monitor the lot with controlled release gates and evidence trace.",
    actions,
    lotDisposition,
    requiredApprovals:
      template.id === "thermal_excursion"
        ? risk.riskLevel === "critical"
          ? ["Production Supervisor", "Process Engineering", "Quality Lead"]
          : ["Production Supervisor", "Process Engineering"]
        : template.id === "spindle_degradation"
          ? risk.riskLevel === "critical"
            ? ["Reliability Engineering", "Quality Lead", "Manufacturing Engineering"]
            : ["Reliability Engineering", "Quality Lead"]
          : risk.riskLevel === "critical"
            ? ["Shift Lead", "Quality Lead", "Manufacturing Engineering"]
            : ["Shift Lead", "Quality Lead"],
    confidence: risk.riskLevel === "critical" ? 94 : 87,
    missingContext
  };
}

function tokenize(query: string) {
  return query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length > 2);
}

export function buildDefaultQuery(input: ScenarioInput) {
  const scenarioInput = resolveScenarioInput(input);
  const template = getScenarioTemplate(scenarioInput);

  return [
    template.focusArea,
    scenarioInput.surfaceFinishStatus,
    "surface finish",
    scenarioInput.sampleExpansion.replaceAll("_", " "),
    scenarioInput.vibrationBand,
    scenarioInput.temperatureBand,
    "maintenance approval"
  ].join(" ");
}

export function searchKnowledgeDocuments(query: string, input: ScenarioInput, limit = 4) {
  const scenarioInput = resolveScenarioInput(input);
  const template = getScenarioTemplate(scenarioInput);
  const scenarioTerms = tokenize(
    `${query} ${template.focusArea} ${scenarioInput.lineId} ${scenarioInput.lotId} ${scenarioInput.machineId ?? ""} ${scenarioInput.surfaceFinishStatus} ${scenarioInput.vibrationBand} ${scenarioInput.temperatureBand} ${scenarioInput.sampleExpansion}`
  );

  return twinKnowledgeCorpus
    .map((document) => {
      const haystack = `${document.title} ${document.owner} ${document.type} ${document.snippet} ${document.tags.join(" ")} ${document.control}`.toLowerCase();
      const matchedTerms = Array.from(new Set(scenarioTerms.filter((term) => haystack.includes(term))));
      const relevance = matchedTerms.reduce((sum, term) => {
        if (document.tags.some((tag) => tag.includes(term))) {
          return sum + 0.25;
        }
        return sum + 0.12;
      }, 0.24);
      const scenarioBoost = document.scenarioTemplates?.includes(template.id) ? 0.35 : 0;

      return {
        ...document,
        matchedTerms,
        relevance: relevance + scenarioBoost,
        confidence: Math.max(72, Math.min(97, Math.round(70 + (relevance + scenarioBoost) * 30)))
      };
    })
    .sort((left, right) => right.relevance - left.relevance || right.confidence - left.confidence)
    .slice(0, limit);
}

function formatTwinClock(minuteOffset: number) {
  const timestamp = new Date(new Date(BASE_TIME).getTime() + minuteOffset * 60_000).toISOString();
  return formatClock(timestamp);
}

function formatFixed(value: number, unit: string) {
  return `${value.toFixed(2)} ${unit}`;
}

function formatInteger(value: number, unit: string) {
  return `${Math.round(value)} ${unit}`;
}

function getTwinActiveIndex(run: SimulationRun) {
  return stepToTwinFrameIndex[run.currentStep];
}

export function getTwinActiveFrameIndex(run: SimulationRun) {
  return getTwinActiveIndex(run);
}

function getTwinFrameStatus(run: SimulationRun, phaseId: TwinPhaseId, index: number) {
  if (index > getTwinActiveIndex(run)) {
    return "locked" as const;
  }

  switch (phaseId) {
    case "baseline":
      return "ready" as const;
    case "anomaly":
      return run.risk.riskLevel === "critical" ? ("review" as const) : ("simulated" as const);
    case "containment":
      return "review" as const;
    case "retrieval":
      return "ready" as const;
    case "review_gate":
      return "approval" as const;
    case "decision":
      if (run.decision?.verdict === "approve") {
        return "ready" as const;
      }
      if (run.decision?.verdict === "reject") {
        return "review" as const;
      }
      return "approval" as const;
    case "evidence":
      return run.evidencePacket ? ("testnet" as const) : ("locked" as const);
  }
}

function getRiskLevelForPhase(run: SimulationRun, phaseId: TwinPhaseId): RiskAssessment["riskLevel"] {
  if (phaseId === "baseline") {
    return "stable";
  }

  if ((phaseId === "decision" || phaseId === "evidence") && run.decision?.verdict === "approve") {
    return run.risk.riskLevel === "critical" ? "watch" : run.risk.riskLevel;
  }

  return run.risk.riskLevel;
}

function getPhaseVibration(run: SimulationRun, phaseId: TwinPhaseId) {
  const base = vibrationBands[run.scenarioInput.vibrationBand];

  switch (phaseId) {
    case "baseline":
      return Math.max(base - 0.17, 0.28);
    case "anomaly":
      return base;
    case "containment":
      return Math.max(base - 0.04, 0.3);
    case "retrieval":
      return Math.max(base - 0.06, 0.29);
    case "review_gate":
      return Math.max(base - 0.05, 0.29);
    case "decision":
      return Math.max(base - (run.decision?.verdict === "approve" ? 0.14 : 0.05), 0.27);
    case "evidence":
      return Math.max(base - (run.decision?.verdict === "approve" ? 0.18 : 0.03), 0.26);
  }
}

function getPhaseTemperature(run: SimulationRun, phaseId: TwinPhaseId) {
  const base = temperatureBands[run.scenarioInput.temperatureBand];

  switch (phaseId) {
    case "baseline":
      return Math.max(base - 5, 38);
    case "anomaly":
      return base;
    case "containment":
      return base - 1;
    case "retrieval":
      return base - 2;
    case "review_gate":
      return base - 2;
    case "decision":
      return base - (run.decision?.verdict === "approve" ? 4 : 1);
    case "evidence":
      return base - (run.decision?.verdict === "approve" ? 5 : 1);
  }
}

function getPhaseCpk(run: SimulationRun, phaseId: TwinPhaseId) {
  const base = run.scenarioInput.cpk;

  switch (phaseId) {
    case "baseline":
      return Math.max(base + 0.18, 1.33);
    case "anomaly":
      return Math.max(base - 0.06, 0.82);
    case "containment":
      return base;
    case "retrieval":
      return base + 0.01;
    case "review_gate":
      return base + 0.01;
    case "decision":
      if (run.decision?.verdict === "approve") {
        return base + 0.08;
      }
      if (run.decision?.verdict === "reject") {
        return Math.max(base - 0.02, 0.8);
      }
      return base;
    case "evidence":
      if (run.decision?.verdict === "approve") {
        return base + 0.11;
      }
      if (run.decision?.verdict === "reject") {
        return Math.max(base - 0.01, 0.8);
      }
      return base;
  }
}

function getPhaseGenealogyCoverage(run: SimulationRun, phaseId: TwinPhaseId) {
  const target = genealogyCoverageByExpansion[run.scenarioInput.sampleExpansion];

  switch (phaseId) {
    case "baseline":
      return 12;
    case "anomaly":
      return Math.round(target * 0.38);
    case "containment":
      return target;
    case "retrieval":
      return target;
    case "review_gate":
      return target;
    case "decision":
      return target;
    case "evidence":
      return target;
  }
}

function getPhaseSourceConfidence(run: SimulationRun, phaseId: TwinPhaseId) {
  if (phaseId === "baseline" || phaseId === "anomaly" || phaseId === "containment") {
    return 0;
  }

  if (phaseId === "evidence") {
    return Math.min(run.recommendation.confidence + 2, 99);
  }

  return run.recommendation.confidence;
}

function getDecisionLabel(run: SimulationRun) {
  if (run.decision?.verdict === "approve") {
    return "Controlled release approved";
  }
  if (run.decision?.verdict === "reject") {
    return "Lot hold maintained";
  }
  if (run.decision?.verdict === "escalate") {
    return "Escalated to engineering board";
  }
  return "Decision not recorded";
}

function getScenarioVocabulary(run: SimulationRun) {
  const template = getScenarioTemplate(run.scenarioInput);

  if (template.id === "thermal_excursion") {
    return {
      processCellLabel: "Thermal Cell",
      labLabel: "Thermal Metrology",
      processLineLabel: "Thermal processing cell",
      lineNominal: "Within thermal stability envelope",
      lineAnomaly:
        run.scenarioInput.temperatureBand === "critical"
          ? "Coolant thermal excursion confirmed"
          : "Thermal drift rising",
      lineContainment: "Thermal load shadow-limited",
      lineRetrieved: "Thermal envelope linked to retrieved standards",
      lineReview: "Awaiting human reroute or release decision",
      metrologyBaseline: "Thermal SPC cadence",
      metrologyAnomaly: "Thermal sample expansion signaled",
      metrologyContainment: "Heat-load verification queued",
      metrologyRetrieved: "Thermal results linked to source trace",
      metrologyReview: "Reroute package ready",
      qmsBaseline: "No thermal containment active",
      qmsAnomaly: "Thermal containment staged",
      qmsContainment: "Shadow route protection active",
      qmsRetrieved: "Source trace attached to route packet",
      controlBridgeAnomaly: "QMS and MES route targets identified",
      controlBridgeDecisionApprove: "Controlled reroute note armed",
      controlBridgeDecisionReject: "Thermal hold notes armed",
      controlBridgeDecisionEscalate: "Thermal escalation package armed",
      narrativeBaseline:
        "The twin reconstructs a nominal thermal envelope so the excursion can be compared against a stable coolant and line-load baseline.",
      narrativeAnomaly:
        "Edge-normalized thermal signals show the coolant loop crossing its guardrail before any simulated route protection is committed.",
      narrativeContainment:
        "The cyber-physical twin latches the thermal excursion, adjacent route protection, and verification scope into a replayable containment state.",
      narrativeRetrieval:
        "Retrieved process, thermal, and compliance sources are bound to the twin so the reroute and release path is auditable.",
      retrievalTrace: "Approved corpus retrieval is attached to the thermal protection packet.",
      containmentAlert: "Adjacent route protection is now included in the thermal shadow state."
    };
  }

  if (template.id === "spindle_degradation") {
    return {
      processCellLabel: "Reliability Cell",
      labLabel: "Reliability Lab",
      processLineLabel: "Reliability-monitored cell",
      lineNominal: "Within qualified spindle health envelope",
      lineAnomaly:
        run.scenarioInput.vibrationBand === "critical"
          ? "Spindle degradation pattern confirmed"
          : "Spindle drift rising",
      lineContainment: "Feed and release shadow-limited",
      lineRetrieved: "Reliability threshold linked to retrieved standards",
      lineReview: "Awaiting human release decision",
      metrologyBaseline: "Reliability sampling cadence",
      metrologyAnomaly: "Capability expansion signaled",
      metrologyContainment: "Wear verification queued",
      metrologyRetrieved: "Reliability trace linked to source cards",
      metrologyReview: "Reliability package ready",
      qmsBaseline: "No degradation hold active",
      qmsAnomaly: "Reliability containment staged",
      qmsContainment: "Shadow maintenance hold active",
      qmsRetrieved: "Source trace attached to maintenance packet",
      controlBridgeAnomaly: "QMS and CMMS targets identified",
      controlBridgeDecisionApprove: "Controlled release note armed",
      controlBridgeDecisionReject: "Hold and maintenance notes armed",
      controlBridgeDecisionEscalate: "Reliability escalation package armed",
      narrativeBaseline:
        "The twin reconstructs a nominal spindle-health envelope so the degradation trend can be compared against a stable machine baseline.",
      narrativeAnomaly:
        "Edge-normalized vibration and capability signals show the degradation pattern crossing advisory thresholds before any simulated maintenance response is committed.",
      narrativeContainment:
        "The cyber-physical twin latches the degradation pattern, genealogy scope, and maintenance staging into a replayable containment state.",
      narrativeRetrieval:
        "Retrieved reliability, maintenance, and compliance sources are bound to the twin so the response path is auditable.",
      retrievalTrace: "Approved corpus retrieval is attached to the reliability containment packet.",
      containmentAlert: "Adjacent lot genealogy is now included in the reliability shadow state."
    };
  }

  return {
    processCellLabel: "Grinding Cell",
    labLabel: "Metrology Lab",
    processLineLabel: "Grinding cell",
    lineNominal: "Within qualified process window",
    lineAnomaly:
      run.scenarioInput.surfaceFinishStatus === "breach"
        ? "Surface finish breach confirmed"
        : run.scenarioInput.surfaceFinishStatus === "drift"
          ? "Surface finish drift rising"
          : "Process window nominal",
    lineContainment: "Speed and feed shadow-frozen",
    lineRetrieved: "Process window linked to retrieved standards",
    lineReview: "Awaiting human release decision",
    metrologyBaseline: "Routine SPC cadence",
    metrologyAnomaly: `${run.scenarioInput.sampleExpansion.replaceAll("_", " ")} sampling signaled`,
    metrologyContainment: "Expanded samples queued",
    metrologyRetrieved: "Results linked to source trace",
    metrologyReview: "Disposition package ready",
    qmsBaseline: "No hold active",
    qmsAnomaly: "Containment recommendation staged",
    qmsContainment: "Shadow lot hold active",
    qmsRetrieved: "Source trace attached to hold packet",
    controlBridgeAnomaly: "QMS and CMMS targets identified",
    controlBridgeDecisionApprove: "Controlled release note armed",
    controlBridgeDecisionReject: "Hold and maintenance notes armed",
    controlBridgeDecisionEscalate: "Escalation package armed",
    narrativeBaseline:
      "The twin reconstructs a nominal pre-excursion state so the quality hold can be compared against a known operating envelope.",
    narrativeAnomaly:
      "Edge-normalized signals show the excursion crossing advisory thresholds before any simulated containment is committed.",
    narrativeContainment:
      "The cyber-physical twin latches the lot, adjacent genealogy, and sample expansion scope into a replayable containment state.",
    narrativeRetrieval:
      "Retrieved engineering, quality, maintenance, and compliance sources are bound to the twin so the response path is auditable.",
    retrievalTrace: "Approved corpus retrieval is attached to the containment packet.",
    containmentAlert: "Adjacent lot genealogy is now included in the containment shadow state."
  };
}

function getLineState(run: SimulationRun, phaseId: TwinPhaseId) {
  const vocabulary = getScenarioVocabulary(run);

  switch (phaseId) {
    case "baseline":
      return vocabulary.lineNominal;
    case "anomaly":
      return vocabulary.lineAnomaly;
    case "containment":
      return vocabulary.lineContainment;
    case "retrieval":
      return vocabulary.lineRetrieved;
    case "review_gate":
      return vocabulary.lineReview;
    case "decision":
      return run.decision?.verdict === "approve"
        ? "Controlled release path armed"
        : run.decision?.verdict === "reject"
          ? "Lot hold retained"
          : run.decision?.verdict === "escalate"
            ? "Escalation path opened"
            : "Decision pending";
    case "evidence":
      return run.evidencePacket ? "Decision and evidence synchronized" : "Evidence closeout pending";
  }
}

function getQmsState(run: SimulationRun, phaseId: TwinPhaseId) {
  const vocabulary = getScenarioVocabulary(run);
  switch (phaseId) {
    case "baseline":
      return vocabulary.qmsBaseline;
    case "anomaly":
      return vocabulary.qmsAnomaly;
    case "containment":
      return vocabulary.qmsContainment;
    case "retrieval":
      return vocabulary.qmsRetrieved;
    case "review_gate":
      return "Operator approval required";
    case "decision":
      return run.decision?.verdict === "approve"
        ? "Controlled release gate armed"
        : run.decision?.verdict === "reject"
          ? "Lot hold locked"
          : run.decision?.verdict === "escalate"
            ? "Engineering board hold"
            : "Decision pending";
    case "evidence":
      return run.evidencePacket ? "Evidence reference attached" : "Awaiting evidence packet";
  }
}

function buildTwinTelemetry(run: SimulationRun, phaseId: TwinPhaseId): TwinTelemetry[] {
  const template = getScenarioTemplate(run.scenarioInput);
  const vibration = getPhaseVibration(run, phaseId);
  const temperature = getPhaseTemperature(run, phaseId);
  const cpk = getPhaseCpk(run, phaseId);
  const genealogyCoverage = getPhaseGenealogyCoverage(run, phaseId);
  const sourceConfidence = getPhaseSourceConfidence(run, phaseId);

  const firstTelemetry =
    template.id === "thermal_excursion"
      ? {
          label: "Coolant temperature",
          value: formatInteger(temperature, "C"),
          trend:
            phaseId === "decision" || phaseId === "evidence"
              ? "cooling under route protection"
              : "replayed thermal guardrail",
          detail: "Thermal state is replayed to show coolant instability before any release or reroute recommendation.",
          status: temperature >= 58 ? ("review" as const) : temperature >= 50 ? ("simulated" as const) : ("ready" as const)
        }
      : {
          label: "Spindle vibration",
          value: formatFixed(vibration, "g"),
          trend:
            phaseId === "baseline"
              ? "baseline envelope"
              : phaseId === "evidence"
                ? "stabilized after review"
                : "replayed from advisory stream",
          detail:
            template.id === "spindle_degradation"
              ? "Derived from simulated normalized spindle telemetry in the reliability degradation scenario."
              : "Derived from simulated normalized spindle telemetry in the quality containment scenario.",
          status: vibration >= 0.88 ? ("review" as const) : vibration >= 0.65 ? ("simulated" as const) : ("ready" as const)
        };

  const secondTelemetry =
    template.id === "thermal_excursion"
      ? {
          label: "Line vibration",
          value: formatFixed(vibration, "g"),
          trend: "coupled mechanical load",
          detail: "Vibration is tracked as a secondary signal to the thermal excursion for coupled instability review.",
          status: vibration >= 0.88 ? ("review" as const) : vibration >= 0.65 ? ("simulated" as const) : ("ready" as const)
        }
      : {
          label: "Coolant temperature",
          value: formatInteger(temperature, "C"),
          trend:
            phaseId === "decision" || phaseId === "evidence"
              ? "cooling under containment"
              : "watch for thermal drift",
          detail: "Thermal state is replayed to show process instability before any release recommendation.",
          status: temperature >= 58 ? ("review" as const) : temperature >= 50 ? ("simulated" as const) : ("ready" as const)
        };

  return [
    firstTelemetry,
    secondTelemetry,
    {
      label: "Process Cpk",
      value: cpk.toFixed(2),
      trend: phaseId === "baseline" ? "pre-excursion baseline" : phaseId === "evidence" ? "post-decision replay" : "live replay capability",
      detail: "Capability shifts drive containment, escalation, and controlled-release logic.",
      status: cpk < 1.0 ? "review" : cpk < 1.33 ? "simulated" : "ready"
    },
    {
      label: phaseId === "baseline" || phaseId === "anomaly" || phaseId === "containment" ? "Genealogy coverage" : "Source confidence",
      value:
        phaseId === "baseline" || phaseId === "anomaly" || phaseId === "containment"
          ? `${genealogyCoverage}%`
          : `${sourceConfidence}%`,
      trend:
        phaseId === "baseline" || phaseId === "anomaly" || phaseId === "containment"
          ? "adjacent-lot replay scope"
          : "approved corpus traceability",
      detail:
        phaseId === "baseline" || phaseId === "anomaly" || phaseId === "containment"
          ? "Genealogy links show which adjacent lots join the containment shadow state."
          : "Confidence is tied to deterministic retrieval over the approved local corpus.",
      status:
        phaseId === "baseline"
          ? "locked"
          : phaseId === "anomaly"
            ? "simulated"
            : phaseId === "containment"
              ? "ready"
              : sourceConfidence >= 90
                ? "ready"
                : "simulated"
    }
  ];
}

function buildTwinSubsystems(run: SimulationRun, phaseId: TwinPhaseId): TwinSubsystemState[] {
  const vocabulary = getScenarioVocabulary(run);

  return [
    {
      id: "sensor-fabric",
      label: "Sensor fabric",
      state:
        phaseId === "baseline"
          ? "Nominal heartbeat"
          : phaseId === "anomaly"
            ? "Anomaly packet emitted"
            : phaseId === "containment"
              ? "Genealogy correlation active"
              : phaseId === "retrieval"
                ? "Context pack materialized"
                : phaseId === "review_gate"
                  ? "Awaiting review confirmation"
                  : phaseId === "decision"
                    ? "Decision routed"
                    : "Evidence closeout transmitted",
      detail: "Edge-normalized data remains simulated and read-only.",
      status: phaseId === "baseline" ? "ready" : phaseId === "anomaly" ? "simulated" : "ready"
    },
    {
      id: "process-cell",
      label: vocabulary.processCellLabel,
      state: getLineState(run, phaseId),
      detail: `${vocabulary.processLineLabel} ${run.scenarioInput.lineId} remains shadow-only with no direct actuator authority.`,
      status: getRiskLevelForPhase(run, phaseId) === "critical" ? "review" : "simulated"
    },
    {
      id: "metrology",
      label: vocabulary.labLabel,
      state:
        phaseId === "baseline"
          ? vocabulary.metrologyBaseline
          : phaseId === "anomaly"
            ? vocabulary.metrologyAnomaly
            : phaseId === "containment"
              ? vocabulary.metrologyContainment
              : phaseId === "retrieval"
                ? vocabulary.metrologyRetrieved
                : phaseId === "review_gate"
                  ? vocabulary.metrologyReview
                  : phaseId === "decision"
                    ? getDecisionLabel(run)
                    : "Archive set prepared",
      detail: "Lab outputs remain simulated but are synchronized with the lot genealogy trail.",
      status: phaseId === "baseline" ? "ready" : phaseId === "review_gate" ? "approval" : "simulated"
    },
    {
      id: "qms",
      label: "QMS governance",
      state: getQmsState(run, phaseId),
      detail: "QMS writes are shadow targets only until a reviewer explicitly commits the decision.",
      status:
        phaseId === "review_gate"
          ? "approval"
          : phaseId === "decision" && run.decision?.verdict === "approve"
            ? "ready"
            : phaseId === "decision" && run.decision?.verdict === "reject"
              ? "review"
              : "simulated"
    },
    {
      id: "control-bridge",
      label: "Control bridge",
      state:
        phaseId === "baseline"
          ? "No writebacks staged"
          : phaseId === "anomaly"
            ? vocabulary.controlBridgeAnomaly
            : phaseId === "containment"
              ? "Shadow writebacks assembled"
              : phaseId === "retrieval"
                ? "Awaiting review gate"
                : phaseId === "review_gate"
                  ? "Hard-blocked pending operator approval"
                  : phaseId === "decision"
                    ? run.decision?.verdict === "approve"
                      ? vocabulary.controlBridgeDecisionApprove
                      : run.decision?.verdict === "reject"
                        ? vocabulary.controlBridgeDecisionReject
                        : run.decision?.verdict === "escalate"
                          ? vocabulary.controlBridgeDecisionEscalate
                          : "Decision pending"
                    : run.evidencePacket
                      ? "Recorded in local evidence trail"
                      : "Awaiting packet closeout",
      detail: "The bridge simulates MES, QMS, and CMMS outputs without writing to production systems.",
      status:
        phaseId === "review_gate"
          ? "approval"
          : phaseId === "evidence" && run.evidencePacket
            ? "testnet"
            : "locked"
    },
    {
      id: "provenance",
      label: "Evidence ledger",
      state:
        phaseId === "baseline"
          ? "No anchor candidate"
          : phaseId === "anomaly"
            ? "Packet skeleton assembling"
            : phaseId === "containment"
              ? "Containment evidence staged"
              : phaseId === "retrieval"
                ? "Source trace attached"
                : phaseId === "review_gate"
                  ? "Approval slot reserved"
                  : phaseId === "decision"
                    ? "Decision hash pending"
                    : run.evidencePacket
                      ? "Canonical hash recorded"
                      : "Awaiting evidence closeout",
      detail: "Hashing remains local-only and suitable for later Supabase or permissioned-ledger persistence.",
      status: phaseId === "evidence" && run.evidencePacket ? "testnet" : phaseId === "baseline" ? "locked" : "simulated"
    }
  ];
}

function buildShadowWritebacks(run: SimulationRun, phaseId: TwinPhaseId): ShadowWriteback[] {
  const template = getScenarioTemplate(run.scenarioInput);
  const approveDetail =
    template.id === "thermal_excursion"
      ? "Shadow-controlled reroute and release packets remain review-gated and never write to live equipment."
      : "Shadow-controlled release packet for MES/QMS remains review-gated and never writes to equipment.";
  const rejectDetail =
    template.id === "thermal_excursion"
      ? "Thermal hold notes and reroute protection remain simulation outputs only."
      : "Shadow hold note and maintenance escalation remain simulation outputs only.";
  const escalationDetail = "Engineering board escalation package is prepared without any live system submission.";

  switch (phaseId) {
    case "baseline":
      return [
        {
          system: "QMS",
          action: "Lot hold",
          mode: "blocked",
          detail: "No containment request exists yet.",
          status: "locked"
        },
        {
          system: "MES",
          action: template.id === "thermal_excursion" ? "Thermal route protection" : "Route diversion",
          mode: "blocked",
          detail: "No shadow reroute is staged during baseline operation.",
          status: "locked"
        },
        {
          system: "CMMS",
          action: template.id === "thermal_excursion" ? "Coolant loop inspection" : "Spindle inspection",
          mode: "blocked",
          detail: template.id === "thermal_excursion" ? "Thermal maintenance stays on watch-only cadence." : "Maintenance stays on watch-only cadence.",
          status: "locked"
        },
        {
          system: "Ledger",
          action: "Evidence anchor",
          mode: "blocked",
          detail: "No evidence packet exists during the baseline frame.",
          status: "locked"
        }
      ];
    case "anomaly":
      return [
        {
          system: "QMS",
          action: "Lot hold recommendation",
          mode: "staged",
          detail: "Containment recommendation is prepared from the anomaly packet.",
          status: "review"
        },
        {
          system: "MES",
          action: template.id === "thermal_excursion" ? "Route protection preview" : "Route diversion preview",
          mode: "blocked",
          detail: "Route changes stay blocked until containment is acknowledged.",
          status: "locked"
        },
        {
          system: "CMMS",
          action: template.id === "thermal_excursion" ? "Coolant loop inspection recommendation" : "Spindle inspection recommendation",
          mode: "staged",
          detail: template.id === "thermal_excursion" ? "Thermal inspection is queued in shadow mode." : "Condition-based inspection is queued in shadow mode.",
          status: "simulated"
        },
        {
          system: "Ledger",
          action: "Evidence packet skeleton",
          mode: "staged",
          detail: "Provenance context begins assembling, but no hash is finalized.",
          status: "simulated"
        }
      ];
    case "containment":
      return [
        {
          system: "QMS",
          action: "Lot hold shadow write",
          mode: "armed",
          detail: "Containment is latched in the twin but not written to a live QMS.",
          status: "approval"
        },
        {
          system: "MES",
          action: template.id === "thermal_excursion" ? "Adjacent route protection" : "Adjacency quarantine",
          mode: "staged",
          detail: "Genealogy-linked routing holds are prepared for operator review.",
          status: "simulated"
        },
        {
          system: "CMMS",
          action: template.id === "thermal_excursion" ? "Coolant inspection shadow order" : "Spindle inspection shadow order",
          mode: "armed",
          detail: "Maintenance action is ready for human approval only.",
          status: "approval"
        },
        {
          system: "Ledger",
          action: "Containment evidence bundle",
          mode: "staged",
          detail: "Packet skeleton references lot genealogy and sample expansion scope.",
          status: "simulated"
        }
      ];
    case "retrieval":
      return [
        {
          system: "QMS",
          action: "Source-backed hold note",
          mode: "armed",
          detail: "Approved corpus sources are now attached to the simulated hold packet.",
          status: "ready"
        },
        {
          system: "MES",
          action: "Disposition bridge preview",
          mode: "staged",
          detail: "Release or reroute options remain blocked until operator review.",
          status: "approval"
        },
        {
          system: "CMMS",
          action: template.id === "thermal_excursion" ? "Thermal inspection packet" : "Condition-based inspection packet",
          mode: "armed",
          detail:
            template.id === "thermal_excursion"
              ? "Thermal evidence is linked to coolant protection guidance."
              : "Maintenance evidence is linked to spindle threshold guidance.",
          status: "ready"
        },
        {
          system: "Ledger",
          action: "Evidence packet enrichment",
          mode: "staged",
          detail: "Source references and retrieval confidence are added to the packet.",
          status: "simulated"
        }
      ];
    case "review_gate":
      return [
        {
          system: "QMS",
          action: "Disposition writeback",
          mode: "blocked",
          detail: "Reviewer identity is required before any shadow QMS record is committed.",
          status: "approval"
        },
        {
          system: "MES",
          action: "Controlled release or hold route",
          mode: "blocked",
          detail: "MES bridge stays hard-blocked pending human approval.",
          status: "approval"
        },
        {
          system: "CMMS",
          action: "Maintenance response",
          mode: "blocked",
          detail: "Maintenance actions wait on the same review gate as the disposition path.",
          status: "approval"
        },
        {
          system: "Ledger",
          action: "Approval slot reservation",
          mode: "staged",
          detail: "The evidence packet reserves approval metadata but has no final hash.",
          status: "simulated"
        }
      ];
    case "decision":
      return [
        {
          system: "QMS",
          action: run.decision?.verdict === "approve" ? "Controlled release note" : "Lot hold record",
          mode: "armed",
          detail:
            run.decision?.verdict === "approve"
              ? approveDetail
              : run.decision?.verdict === "escalate"
                ? escalationDetail
                : rejectDetail,
          status:
            run.decision?.verdict === "approve"
              ? "ready"
              : run.decision?.verdict === "reject"
                ? "review"
                : "approval"
        },
        {
          system: "MES",
          action:
            run.decision?.verdict === "approve"
              ? "Controlled release route"
              : run.decision?.verdict === "reject"
                ? "Route hold"
                : "Route block",
          mode: run.decision?.verdict === "approve" ? "armed" : "staged",
          detail:
            run.decision?.verdict === "approve"
              ? approveDetail
              : run.decision?.verdict === "escalate"
                ? escalationDetail
                : rejectDetail,
          status:
            run.decision?.verdict === "approve"
              ? "ready"
              : run.decision?.verdict === "reject"
                ? "review"
                : "approval"
        },
        {
          system: "CMMS",
          action: template.id === "thermal_excursion" ? "Thermal maintenance response" : "Spindle maintenance response",
          mode: "armed",
          detail:
            run.decision?.verdict === "approve"
              ? template.id === "thermal_excursion"
                ? "Thermal inspection remains recommended after reroute or release."
                : "Condition-based inspection remains recommended after release."
              : rejectDetail,
          status: run.decision?.verdict === "approve" ? "simulated" : "review"
        },
        {
          system: "Ledger",
          action: "Decision hash staging",
          mode: "staged",
          detail: "Reviewer note, verdict, and event lineage are ready for final packet hashing.",
          status: "simulated"
        }
      ];
    case "evidence":
      return [
        {
          system: "QMS",
          action: run.decision?.verdict === "approve" ? "Controlled release note" : "Lot hold record",
          mode: "recorded",
          detail: run.evidencePacket ? "Shadow disposition recorded inside the evidence packet." : "Awaiting packet closeout.",
          status: run.evidencePacket ? "testnet" : "locked"
        },
        {
          system: "MES",
          action:
            run.decision?.verdict === "approve"
              ? "Controlled release route"
              : run.decision?.verdict === "reject"
                ? "Route hold"
                : "Engineering board block",
          mode: "recorded",
          detail: "Route outcome is preserved as evidence only. No production system receives a live command.",
          status: run.evidencePacket ? "testnet" : "locked"
        },
        {
          system: "CMMS",
          action: "Maintenance packet",
          mode: "recorded",
          detail: "Maintenance recommendation is attached to the evidence packet for later persistence.",
          status: run.evidencePacket ? "testnet" : "locked"
        },
        {
          system: "Ledger",
          action: "Canonical evidence anchor",
          mode: run.evidencePacket ? "recorded" : "staged",
          detail: run.evidencePacket ? `Local hash ${run.evidencePacket.hash} recorded.` : "Awaiting final hash generation.",
          status: run.evidencePacket ? "testnet" : "locked"
        }
      ];
  }
}

function buildTwinAlerts(run: SimulationRun, phaseId: TwinPhaseId) {
  const vocabulary = getScenarioVocabulary(run);
  const alerts = [...run.risk.rationale];

  if (phaseId === "review_gate") {
    alerts.unshift("Release path is blocked until the operator review decision is captured.");
  }

  if (phaseId === "decision") {
    alerts.unshift(getDecisionLabel(run));
  }

  if (phaseId === "evidence") {
    alerts.unshift(
      run.evidencePacket
        ? "Canonical evidence JSON has been hashed for provenance replay."
        : "Evidence closeout is still pending a final hash."
    );
  }

  if (phaseId === "retrieval") {
    alerts.unshift(vocabulary.retrievalTrace);
  }

  if (phaseId === "containment") {
    alerts.unshift(vocabulary.containmentAlert);
  }

  return Array.from(new Set(alerts)).slice(0, 4);
}

function buildTwinNodes(run: SimulationRun, phaseId: TwinPhaseId): TwinNode[] {
  const template = getScenarioTemplate(run.scenarioInput);
  const vocabulary = getScenarioVocabulary(run);
  const vibration = getPhaseVibration(run, phaseId);
  const cpk = getPhaseCpk(run, phaseId);
  const temperature = getPhaseTemperature(run, phaseId);
  const writebacks = buildShadowWritebacks(run, phaseId);
  const armedWritebackCount = writebacks.filter((writeback) => writeback.mode === "armed" || writeback.mode === "recorded").length;

  return [
    {
      id: "edge",
      label: "Edge Gateway",
      state:
        phaseId === "baseline"
          ? "Heartbeat nominal"
          : phaseId === "anomaly"
            ? "Anomaly message emitted"
            : phaseId === "containment"
              ? "Genealogy correlated"
              : phaseId === "retrieval"
                ? "Context pack assembled"
                : phaseId === "review_gate"
                  ? "Review wait state"
                  : phaseId === "decision"
                    ? "Decision routed"
                    : "Closeout transmitted",
      metric: phaseId === "baseline" ? "1.1K EVENTS/MIN" : phaseId === "anomaly" ? "1.8K EVENTS/MIN" : "2.0K EVENTS/MIN",
      detail: "OPC UA and MQTT are normalized into the twin event backbone.",
      status: phaseId === "baseline" ? "ready" : "simulated",
      x: 12,
      y: 36
    },
    {
      id: "line",
      label: vocabulary.processCellLabel,
      state: getLineState(run, phaseId),
      metric: template.id === "thermal_excursion" ? `TEMP ${Math.round(temperature)} C` : `VIB ${vibration.toFixed(2)} G`,
      detail:
        template.id === "thermal_excursion"
          ? `Thermal state: ${run.scenarioInput.temperatureBand}.`
          : `Surface state: ${run.scenarioInput.surfaceFinishStatus}.`,
      status: getRiskLevelForPhase(run, phaseId) === "critical" ? "review" : "simulated",
      x: 34,
      y: 20
    },
    {
      id: "lab",
      label: vocabulary.labLabel,
      state:
        phaseId === "baseline"
          ? vocabulary.metrologyBaseline
          : phaseId === "anomaly"
            ? vocabulary.metrologyAnomaly
            : phaseId === "containment"
              ? vocabulary.metrologyContainment
              : phaseId === "retrieval"
                ? vocabulary.metrologyRetrieved
                : phaseId === "review_gate"
                  ? vocabulary.metrologyReview
                  : phaseId === "decision"
                    ? getDecisionLabel(run)
                    : "Archive set prepared",
      metric: `CPK ${cpk.toFixed(2)}`,
      detail: "Lab results are replayed into the lot genealogy context.",
      status: phaseId === "review_gate" ? "approval" : phaseId === "baseline" ? "ready" : "simulated",
      x: 60,
      y: 20
    },
    {
      id: "qms",
      label: "QMS Gate",
      state: getQmsState(run, phaseId),
      metric:
        phaseId === "decision"
          ? run.decision?.verdict?.toUpperCase() ?? "PENDING"
          : phaseId === "evidence"
            ? run.evidencePacket ? "HASH LINKED" : "PENDING"
            : "APPROVAL GATE",
      detail: "Human review gates stay explicit and block all simulated writebacks.",
      status:
        phaseId === "review_gate"
          ? "approval"
          : phaseId === "decision" && run.decision?.verdict === "approve"
            ? "ready"
            : phaseId === "decision" && run.decision?.verdict === "reject"
              ? "review"
              : "simulated",
      x: 45,
      y: 60
    },
    {
      id: "bridge",
      label: "Control Bridge",
      state:
        phaseId === "baseline"
          ? "No writebacks staged"
          : phaseId === "review_gate"
            ? "Writes hard-blocked"
            : phaseId === "evidence" && run.evidencePacket
              ? "Evidence-only records staged"
              : `${armedWritebackCount} shadow targets armed`,
      metric: `${writebacks.length} TARGETS`,
      detail: "Simulated MES, QMS, and CMMS outputs never control machines.",
      status:
        phaseId === "review_gate"
          ? "approval"
          : phaseId === "evidence" && run.evidencePacket
            ? "testnet"
            : "locked",
      x: 68,
      y: 76
    },
    {
      id: "ledger",
      label: "Evidence Ledger",
      state:
        phaseId === "baseline"
          ? "No anchor candidate"
          : phaseId === "anomaly"
            ? "Packet context building"
            : phaseId === "containment"
              ? "Containment packet staged"
              : phaseId === "retrieval"
                ? "Source trace attached"
                : phaseId === "review_gate"
                  ? "Approval slot reserved"
                  : phaseId === "decision"
                    ? "Decision hash pending"
                    : run.evidencePacket
                      ? "Local anchor recorded"
                      : "Awaiting closeout",
      metric:
        run.evidencePacket && phaseId === "evidence"
          ? run.evidencePacket.hash.slice(0, 12)
          : "HASH PENDING",
      detail: "Deterministic local hashing prepares the packet for later persistence layers.",
      status: phaseId === "evidence" && run.evidencePacket ? "testnet" : phaseId === "baseline" ? "locked" : "simulated",
      x: 84,
      y: 48
    }
  ];
}

function getTwinNarrative(run: SimulationRun, phaseId: TwinPhaseId) {
  const vocabulary = getScenarioVocabulary(run);
  switch (phaseId) {
    case "baseline":
      return vocabulary.narrativeBaseline;
    case "anomaly":
      return vocabulary.narrativeAnomaly;
    case "containment":
      return vocabulary.narrativeContainment;
    case "retrieval":
      return vocabulary.narrativeRetrieval;
    case "review_gate":
      return "The control plane is intentionally blocked. The twin exposes the release path, but only a human can commit the decision.";
    case "decision":
      return `The twin records the selected path: ${getDecisionLabel(run).toLowerCase()}. Shadow writebacks remain operator-approved only.`;
    case "evidence":
      return run.evidencePacket
        ? "The evidence layer closes the twin replay with deterministic hashing, approval lineage, and simulated enterprise writeback records."
        : "The twin is ready to close the evidence loop, but no final hash has been generated yet.";
  }
}

function getTwinGatingState(run: SimulationRun, phaseId: TwinPhaseId) {
  switch (phaseId) {
    case "baseline":
      return "No containment gate armed.";
    case "anomaly":
      return "Containment recommendation staged.";
    case "containment":
      return "Lot hold shadow state active.";
    case "retrieval":
      return "Source-backed recommendation assembled.";
    case "review_gate":
      return "Operator approval is the only release path.";
    case "decision":
      return run.decision?.verdict === "approve"
        ? "Controlled release shadow path armed."
        : run.decision?.verdict === "reject"
          ? "Lot hold remains the dominant path."
          : run.decision?.verdict === "escalate"
            ? "Engineering board escalation path armed."
            : "Decision not yet recorded.";
    case "evidence":
      return run.evidencePacket ? "Canonical evidence hash closed." : "Evidence closeout pending.";
  }
}

export function getTwinReplayFrames(run: SimulationRun): TwinFrame[] {
  const activeIndex = getTwinActiveIndex(run);

  return twinFrameDefinitions.map((frame, index) => ({
    index,
    id: frame.id,
    label: frame.label,
    timestamp: formatTwinClock(frame.minuteOffset),
    narrative: getTwinNarrative(run, frame.id),
    gatingState: getTwinGatingState(run, frame.id),
    mode: index <= activeIndex ? "observed" : "forecast",
    status: getTwinFrameStatus(run, frame.id, index),
    riskLevel: getRiskLevelForPhase(run, frame.id),
    nodes: buildTwinNodes(run, frame.id),
    telemetry: buildTwinTelemetry(run, frame.id),
    subsystems: buildTwinSubsystems(run, frame.id),
    writebacks: buildShadowWritebacks(run, frame.id),
    alerts: buildTwinAlerts(run, frame.id)
  }));
}

export function getTwinAssetGraph(run: SimulationRun): TwinAssetNode[] {
  const template = getScenarioTemplate(run.scenarioInput);
  const activeFrame = getTwinReplayFrames(run)[getTwinActiveIndex(run)];
  const activeWritebacks = activeFrame.writebacks;
  const facilityId = run.scenarioInput.facilityId ?? template.presetInput.facilityId ?? "TN-DEMO-01";
  const machineId = run.scenarioInput.machineId ?? template.presetInput.machineId ?? "CELL-DEMO-01";
  const lineLabel =
    template.id === "thermal_excursion"
      ? "Thermal route"
      : template.id === "spindle_degradation"
        ? "Reliability cell"
        : "Grinding route";
  const systemMetric = `${activeWritebacks.filter((writeback) => writeback.mode !== "blocked").length} staged`;

  return [
    {
      id: "facility",
      label: facilityId,
      kind: "facility",
      parentId: null,
      state: "Plant twin envelope active",
      metric: "GLOBAL",
      detail: "Facility scope stays simulated and bounded to the selected incident.",
      status: "ready"
    },
    {
      id: "line",
      label: run.scenarioInput.lineId,
      kind: "line",
      parentId: "facility",
      state: lineLabel,
      metric: activeFrame.riskLevel.toUpperCase(),
      detail: "The line node carries the active cyber-physical incident state.",
      status: activeFrame.status
    },
    {
      id: "cell",
      label: template.title,
      kind: "cell",
      parentId: "line",
      state: activeFrame.label,
      metric: activeFrame.timestamp,
      detail: template.detail,
      status: activeFrame.status
    },
    {
      id: "machine",
      label: machineId,
      kind: "machine",
      parentId: "cell",
      state: activeFrame.nodes[1]?.state ?? "Machine state unavailable",
      metric: activeFrame.nodes[1]?.metric ?? "NO METRIC",
      detail: activeFrame.nodes[1]?.detail ?? "Machine telemetry is unavailable for this frame.",
      status: activeFrame.nodes[1]?.status ?? "locked"
    },
    {
      id: "lot",
      label: run.scenarioInput.lotId,
      kind: "lot",
      parentId: "cell",
      state: run.recommendation.lotDisposition.replaceAll("_", " "),
      metric: run.currentStep.toUpperCase(),
      detail: "The lot remains governed by the twin workflow and evidence state.",
      status: run.decision?.verdict === "approve" ? "ready" : run.evidencePacket ? "testnet" : "review"
    },
    {
      id: "lab",
      label: activeFrame.nodes[2]?.label ?? "Lab",
      kind: "lab",
      parentId: "cell",
      state: activeFrame.nodes[2]?.state ?? "Lab state unavailable",
      metric: activeFrame.nodes[2]?.metric ?? "NO METRIC",
      detail: activeFrame.nodes[2]?.detail ?? "Lab replay state is unavailable for this frame.",
      status: activeFrame.nodes[2]?.status ?? "locked"
    },
    {
      id: "control-systems",
      label: "Shadow control systems",
      kind: "system",
      parentId: "facility",
      state: activeFrame.gatingState,
      metric: systemMetric,
      detail: "MES, QMS, CMMS, and provenance targets remain advisory-only shadow systems.",
      status: activeFrame.writebacks.some((writeback) => writeback.mode === "recorded")
        ? "testnet"
        : activeFrame.writebacks.some((writeback) => writeback.mode === "armed")
          ? "approval"
          : "locked"
    }
  ];
}

function getTwinNodes(run: SimulationRun): TwinNode[] {
  return getTwinReplayFrames(run)[getTwinActiveIndex(run)].nodes;
}

function createEvent(
  runId: string,
  step: WorkflowStepId,
  minuteOffset: number,
  source: string,
  event: string,
  payload: string,
  status: StatusKind
): SimulationEvent {
  const timestamp = new Date(new Date(BASE_TIME).getTime() + minuteOffset * 60_000).toISOString();

  return {
    id: `${runId}-${step}-${minuteOffset}`,
    timestamp: formatClock(timestamp),
    source,
    event,
    payload,
    status
  };
}

function createInitialEvents(runId: string, input: ScenarioInput, risk: RiskAssessment) {
  const template = getScenarioTemplate(input);
  const anomalyPayload =
    template.id === "thermal_excursion"
      ? `${input.lineId} flagged ${input.temperatureBand} coolant temperature with ${input.surfaceFinishStatus} downstream drift`
      : template.id === "spindle_degradation"
        ? `${input.lineId} flagged ${input.vibrationBand} spindle vibration with Cpk replay ${input.cpk.toFixed(2)}`
        : `${input.lineId} flagged ${input.surfaceFinishStatus} with ${input.vibrationBand} vibration band`;
  const containmentPayload =
    template.id === "thermal_excursion"
      ? `Shadow route protection and ${input.sampleExpansion.replaceAll("_", " ")} verification prepared for ${input.lotId}`
      : template.id === "spindle_degradation"
        ? `${input.sampleExpansion.replaceAll("_", " ")} sampling and maintenance shadow state prepared for ${input.lotId}`
        : `${input.sampleExpansion.replaceAll("_", " ")} sampling and shadow hold prepared for ${input.lotId}`;

  return [
    createEvent(
      runId,
      "detect",
      0,
      "Twin Monitor",
      "Advisory condition detected",
      anomalyPayload,
      risk.riskLevel === "critical" ? "review" : "simulated"
    ),
    createEvent(
      runId,
      "detect",
      2,
      "Containment Shadow",
      "Lot and genealogy containment staged",
      containmentPayload,
      "review"
    )
  ];
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableStringify(entry)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const objectValue = value as Record<string, unknown>;
    return `{${Object.keys(objectValue)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(objectValue[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function hashString(value: string) {
  let hash = 0x811c9dc5;

  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193);
  }

  return `0x${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function buildEvidencePacket(run: SimulationRun): EvidencePacket {
  const template = getScenarioTemplate(run.scenarioInput);
  const payload = {
    runId: run.id,
    disposition:
      run.decision?.verdict === "approve"
        ? "controlled_release"
        : run.decision?.verdict === "reject"
          ? "hold"
          : run.decision?.verdict === "escalate"
            ? "engineering_board"
            : run.recommendation.lotDisposition,
    recommendation: run.recommendation,
    approval: run.decision,
    eventIds: run.events.map((event) => event.id)
  } as const;

  const canonicalPayload = stableStringify(payload);

  return {
    hash: hashString(canonicalPayload),
    generatedAt: new Date(new Date(BASE_TIME).getTime() + 21 * 60_000).toISOString(),
    packetId: `EVP-${run.id.toUpperCase().slice(-8)}`,
    summary: `${template.title} evidence packet with traceable sources, approval outcome, and replayed event lineage.`,
    categories: [template.focusArea.toLowerCase(), "operator approval", "evidence trace", "digital twin replay"],
    payload
  };
}

function appendEvent(run: SimulationRun, event: SimulationEvent) {
  return [...run.events, event];
}

function updateTwinNodes(run: SimulationRun) {
  return {
    ...run,
    twinNodes: getTwinNodes(run)
  };
}

export function createSimulationRun(input: ScenarioInput) {
  const scenarioInput = resolveScenarioInput(input);
  const template = getScenarioTemplate(scenarioInput);
  const id =
    template.id === "quality_hold"
      ? createId("qhold")
      : template.id === "thermal_excursion"
        ? createId("therm")
        : createId("spndl");
  const createdAt = new Date().toISOString();
  const risk = assessScenarioRisk(scenarioInput);
  const query = buildDefaultQuery(scenarioInput);
  const retrievedDocuments = searchKnowledgeDocuments(query, scenarioInput);
  const recommendation = buildRecommendation(scenarioInput, risk);

  const initialRun: SimulationRun = {
    id,
    scenarioName: template.title,
    createdAt,
    updatedAt: createdAt,
    currentStep: "detect",
    scenarioInput,
    query,
    risk,
    recommendation,
    decision: null,
    evidencePacket: null,
    twinNodes: [],
    retrievedDocuments,
    events: createInitialEvents(id, input, risk)
  };

  return updateTwinNodes(initialRun);
}

export function updateRunQuery(run: SimulationRun, query: string) {
  const nextRun = {
    ...run,
    query,
    updatedAt: new Date().toISOString(),
    retrievedDocuments: searchKnowledgeDocuments(query, run.scenarioInput)
  };

  return updateTwinNodes(nextRun);
}

export function getWorkflowCardStatus(run: SimulationRun, step: WorkflowStepId) {
  return stepStatus(step, run.currentStep);
}

export function advanceSimulationRun(run: SimulationRun, action: WorkflowAction) {
  let nextRun = { ...run, updatedAt: new Date().toISOString() };

  if (action.type === "advance_detect" && run.currentStep === "detect") {
    nextRun = {
      ...nextRun,
      currentStep: "retrieve",
      events: appendEvent(
        run,
        createEvent(
          run.id,
          "retrieve",
          5,
          "RAG Console",
          "Approved corpus retrieval started",
          `${run.retrievedDocuments.length} documents ranked for ${run.scenarioInput.lotId}`,
          "ready"
        )
      )
    };
    return updateTwinNodes(nextRun);
  }

  if (action.type === "advance_retrieve" && run.currentStep === "retrieve") {
    nextRun = {
      ...nextRun,
      currentStep: "review",
      events: appendEvent(
        run,
        createEvent(
          run.id,
          "review",
          11,
          "Workflow Gate",
          "Operator approval required",
          "Recommendation is now staged for human review and disposition.",
          "approval"
        )
      )
    };
    return updateTwinNodes(nextRun);
  }

  if (action.type === "review" && run.currentStep === "review") {
    const decidedAt = new Date().toISOString();
    const verdictLabels: Record<ApprovalVerdict, string> = {
      approve: "Controlled release approved",
      reject: "Lot hold maintained",
      escalate: "Engineering board escalation"
    };

    nextRun = {
      ...nextRun,
      currentStep: "record",
      decision: {
        verdict: action.verdict,
        reviewer: action.reviewer.trim() || "Shift Lead",
        note: action.note.trim() || "Decision recorded in simulator.",
        decidedAt
      },
      events: appendEvent(
        run,
        createEvent(
          run.id,
          "record",
          16,
          "Quality Review",
          verdictLabels[action.verdict],
          action.note.trim() || `Reviewer recorded ${action.verdict} for ${run.scenarioInput.lotId}.`,
          action.verdict === "approve" ? "ready" : action.verdict === "reject" ? "review" : "approval"
        )
      )
    };

    if (action.verdict === "approve") {
      nextRun.recommendation = {
        ...nextRun.recommendation,
        lotDisposition: "controlled_release"
      };
    } else if (action.verdict === "escalate") {
      nextRun.recommendation = {
        ...nextRun.recommendation,
        lotDisposition: "engineering_board"
      };
    } else {
      nextRun.recommendation = {
        ...nextRun.recommendation,
        lotDisposition: "hold"
      };
    }

    return updateTwinNodes(nextRun);
  }

  if (action.type === "generate_evidence" && run.currentStep === "record") {
    const evidencePacket = buildEvidencePacket(run);
    nextRun = {
      ...nextRun,
      currentStep: "complete",
      evidencePacket,
      events: appendEvent(
        run,
        createEvent(
          run.id,
          "complete",
          21,
          "Provenance Service",
          "Evidence packet generated",
          `${evidencePacket.packetId} hashed locally as ${evidencePacket.hash.slice(0, 18)}`,
          "testnet"
        )
      )
    };
    return updateTwinNodes(nextRun);
  }

  return updateTwinNodes(nextRun);
}

export function getRunSummary(run: SimulationRun) {
  return {
    id: run.id,
    scenarioName: run.scenarioName,
    createdAt: run.createdAt,
    updatedAt: run.updatedAt,
    currentStep: run.currentStep,
    risk: run.risk,
    decision: run.decision,
    lotId: run.scenarioInput.lotId,
    lineId: run.scenarioInput.lineId
  };
}

export function getRunKpis(run: SimulationRun) {
  const template = getScenarioTemplate(run.scenarioInput);
  const evidenceCount = run.evidencePacket ? 1 : 0;
  const twinFrames = getTwinReplayFrames(run);
  const activeTwinFrame = twinFrames[getTwinActiveIndex(run)];

  return [
    {
      label: "Knowledge retrieval coverage",
      value: `${run.risk.kpiImpact.retrievalCoverage}%`,
      delta: `+${run.retrievedDocuments.length} docs`,
      status: "simulated" as const,
      detail: `Approved corpus documents matched to the active ${template.focusArea.toLowerCase()} query.`
    },
    {
      label: "Operator approval discipline",
      value: run.decision ? "100%" : "Pending",
      delta: run.decision ? `1 ${run.decision.verdict}` : "awaiting review",
      status: "approval" as const,
      detail: "The run cannot complete without a recorded human decision."
    },
    {
      label: "Twin replay readiness",
      value: `${twinFrames.length} frames`,
      delta: `${activeTwinFrame.subsystems.length} subsystems`,
      status: "review" as const,
      detail: "Replay state now tracks machine, lab, control bridge, governance, and evidence milestones."
    },
    {
      label: "Evidence anchoring",
      value: evidenceCount ? "1 hash" : "pending",
      delta: evidenceCount ? run.evidencePacket?.hash.slice(0, 10) ?? "" : "local only",
      status: evidenceCount ? ("testnet" as const) : ("locked" as const),
      detail: "Evidence packets hash canonical JSON locally and are ready for a future persistence adapter."
    }
  ];
}

export function getRunQaChecks(run: SimulationRun) {
  const twinFrames = getTwinReplayFrames(run);

  return [
    "Quality-hold inputs are deterministic and replayable for the same run ID.",
    `Workflow state is currently ${run.currentStep} and remains advisory-only.`,
    `Twin replay exposes ${twinFrames.length} frames across ${twinFrames[0]?.subsystems.length ?? 0} cyber-physical subsystems and shadow writeback targets.`,
    run.evidencePacket
      ? `Evidence packet ${run.evidencePacket.packetId} is available with deterministic local hashing.`
      : "Evidence packet has not been generated yet.",
    run.decision
      ? `Human decision recorded by ${run.decision.reviewer} as ${run.decision.verdict}.`
      : "No human decision is recorded yet."
  ];
}
