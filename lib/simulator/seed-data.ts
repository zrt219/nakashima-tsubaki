import type {
  KnowledgeDocument,
  ScenarioInput,
  ScenarioTemplate,
  ScenarioTemplateId
} from "@/lib/simulator/types";

export const scenarioTemplates: ScenarioTemplate[] = [
  {
    id: "quality_hold",
    title: "Surface Quality Hold",
    subtitle: "Grinding and inspection containment loop",
    detail:
      "Replays a line-side surface finish excursion across genealogy containment, metrology expansion, review gating, and evidence closeout.",
    focusArea: "Quality containment",
    controlBoundary: "Advisory lot hold and shadow writebacks only",
    operatorRole: "Quality lead",
    presetInput: {
      scenarioTemplateId: "quality_hold",
      lotId: "LOT-QH-240603-A",
      facilityId: "TN-OSAKA-01",
      lineId: "GRIND-A1",
      machineId: "CELL-A1-SPDL-02",
      vibrationBand: "elevated",
      temperatureBand: "nominal",
      cpk: 1.18,
      surfaceFinishStatus: "drift",
      sampleExpansion: "required",
      operatorShift: "day",
      qualityPriority: "containment"
    }
  },
  {
    id: "thermal_excursion",
    title: "Coolant Thermal Excursion",
    subtitle: "Thermal stability and route protection loop",
    detail:
      "Replays a coolant loop thermal excursion across the line, metrology confirmation, operator review, and shadow production rerouting without live control.",
    focusArea: "Thermal stability",
    controlBoundary: "Shadow reroute and hold signals only",
    operatorRole: "Production supervisor",
    presetInput: {
      scenarioTemplateId: "thermal_excursion",
      lotId: "LOT-TH-240603-B",
      facilityId: "TN-KYOTO-02",
      lineId: "LAP-B4",
      machineId: "COOL-B4-LOOP-07",
      vibrationBand: "nominal",
      temperatureBand: "critical",
      cpk: 1.06,
      surfaceFinishStatus: "drift",
      sampleExpansion: "recommended",
      operatorShift: "swing",
      qualityPriority: "balanced"
    }
  },
  {
    id: "spindle_degradation",
    title: "Spindle Degradation Watch",
    subtitle: "Condition-based maintenance and release gating loop",
    detail:
      "Replays a sustained spindle degradation pattern with condition-based maintenance recommendations, review gating, and evidence anchoring for reliability operations.",
    focusArea: "Maintenance reliability",
    controlBoundary: "Maintenance shadow orders and governed release only",
    operatorRole: "Reliability engineer",
    presetInput: {
      scenarioTemplateId: "spindle_degradation",
      lotId: "LOT-SD-240603-C",
      facilityId: "TN-NAGOYA-03",
      lineId: "GRIND-C2",
      machineId: "CELL-C2-SPDL-05",
      vibrationBand: "critical",
      temperatureBand: "elevated",
      cpk: 0.94,
      surfaceFinishStatus: "breach",
      sampleExpansion: "required",
      operatorShift: "night",
      qualityPriority: "containment"
    }
  }
];

export const defaultScenarioInput: ScenarioInput = scenarioTemplates[0].presetInput;

export function getScenarioTemplateById(id: ScenarioTemplateId | undefined) {
  return scenarioTemplates.find((template) => template.id === id) ?? scenarioTemplates[0];
}

export function buildScenarioInputPreset(id: ScenarioTemplateId) {
  return {
    ...getScenarioTemplateById(id).presetInput
  };
}

export const twinKnowledgeCorpus: KnowledgeDocument[] = [
  {
    id: "SRC-QMS-014",
    title: "Grinding line quality escape review",
    owner: "Quality Engineering",
    type: "QMS procedure",
    snippet:
      "Requires lot hold, inspection sample expansion, root-cause note, and operator signoff before any controlled release.",
    tags: ["quality", "lot hold", "surface finish", "approval"],
    control: "Containment and release",
    scenarioTemplates: ["quality_hold", "spindle_degradation"]
  },
  {
    id: "SRC-MNT-221",
    title: "Spindle vibration advisory threshold",
    owner: "Maintenance Reliability",
    type: "CMMS bulletin",
    snippet:
      "Trend-based inspection should be scheduled when normalized vibration crosses the advisory band for two cycles.",
    tags: ["maintenance", "vibration", "spindle", "advisory"],
    control: "Condition-based maintenance",
    scenarioTemplates: ["quality_hold", "spindle_degradation"]
  },
  {
    id: "SRC-ENG-088",
    title: "Bearing surface finish process window",
    owner: "Manufacturing Engineering",
    type: "Engineering standard",
    snippet:
      "Surface finish deviations require process parameter review, lab verification, and controlled release notes.",
    tags: ["engineering", "surface finish", "process", "verification"],
    control: "Process window",
    scenarioTemplates: ["quality_hold", "spindle_degradation"]
  },
  {
    id: "SRC-LAB-041",
    title: "Metrology sample expansion protocol",
    owner: "Metrology Lab",
    type: "Lab work instruction",
    snippet:
      "When surface finish drift is confirmed, expand sampling to adjacent lots and record lot genealogy links in the evidence packet.",
    tags: ["metrology", "sample expansion", "lot genealogy", "quality"],
    control: "Sample expansion",
    scenarioTemplates: ["quality_hold", "thermal_excursion", "spindle_degradation"]
  },
  {
    id: "SRC-CMP-032",
    title: "Model-assisted decision audit requirements",
    owner: "Compliance",
    type: "Audit control",
    snippet:
      "AI recommendations must include source list, confidence band, reviewer identity, and immutable evidence hash.",
    tags: ["compliance", "model decision", "audit", "evidence"],
    control: "Decision traceability",
    scenarioTemplates: ["quality_hold", "thermal_excursion", "spindle_degradation"]
  },
  {
    id: "SRC-QMS-119",
    title: "Controlled release escalation matrix",
    owner: "Quality Operations",
    type: "Escalation guide",
    snippet:
      "Escalate to engineering board when containment is incomplete, Cpk remains below threshold, or root cause is unresolved.",
    tags: ["controlled release", "escalation", "cpk", "engineering board"],
    control: "Escalation",
    scenarioTemplates: ["quality_hold", "spindle_degradation"]
  },
  {
    id: "SRC-THR-044",
    title: "Coolant loop thermal protection standard",
    owner: "Process Engineering",
    type: "Thermal standard",
    snippet:
      "Critical coolant temperature excursions require route protection, heat-load review, and operator-approved shadow rerouting before controlled restart.",
    tags: ["thermal", "coolant", "temperature", "route protection"],
    control: "Thermal containment",
    scenarioTemplates: ["thermal_excursion"]
  },
  {
    id: "SRC-OPS-077",
    title: "Thermal excursion production reroute guide",
    owner: "Production Control",
    type: "Operations guide",
    snippet:
      "When a line is thermally unstable, adjacent cells may receive shadow route assignments only after operator review and evidence packaging.",
    tags: ["production", "reroute", "thermal", "line balancing"],
    control: "Shadow routing",
    scenarioTemplates: ["thermal_excursion"]
  },
  {
    id: "SRC-RLY-203",
    title: "Spindle degradation reliability playbook",
    owner: "Reliability Engineering",
    type: "Reliability playbook",
    snippet:
      "Persistent vibration growth paired with low capability requires condition-based maintenance staging and governed release review.",
    tags: ["reliability", "spindle", "vibration", "maintenance", "capability"],
    control: "Reliability containment",
    scenarioTemplates: ["spindle_degradation"]
  }
];
