import { TwinScenarioDefinition, EvidenceSource } from "./types";

const mockEvidenceCorpus: EvidenceSource[] = [
  {
    id: "SOP-0456",
    title: "SOP-0456 Thermal Offset Compensation",
    type: "procedure",
    summary: "Instructions for applying deterministic thermal offsets when coolant temperature exceeds 28°C and Z-axis drift is detected.",
    appliesToScenarios: ["thermal", "compound"],
    confidence: 0.95,
    approved: true,
    lastUpdated: "2025-11-12T08:00:00Z",
    simulatedHash: "0x8fae29c...",
  },
  {
    id: "MM-207",
    title: "MM-207 Spindle Maintenance Guide",
    type: "document",
    summary: "Guidelines for bearing inspection and feed reduction mitigation during high-vibration events.",
    appliesToScenarios: ["vibration", "compound"],
    confidence: 0.88,
    approved: true,
    lastUpdated: "2025-06-01T14:30:00Z",
    simulatedHash: "0x3b1c90a...",
  },
  {
    id: "QA-331",
    title: "QA-331 Inspection Packet Standard",
    type: "policy",
    summary: "Mandates dimension packet generation and QA hold when Cpk drops below 1.33.",
    appliesToScenarios: ["quality", "compound"],
    confidence: 1.0,
    approved: true,
    lastUpdated: "2026-01-10T09:15:00Z",
    simulatedHash: "0x55ff11e...",
  },
  {
    id: "SEC-209",
    title: "SEC-209 No Direct PLC Control Boundary",
    type: "policy",
    summary: "Enforces zero-trust isolation between autonomous advisory agents and physical PLC actuators.",
    appliesToScenarios: ["security", "compound"],
    confidence: 1.0,
    approved: true,
    lastUpdated: "2026-05-20T10:00:00Z",
    simulatedHash: "0x99aa88b...",
  }
];

export const SCENARIOS: TwinScenarioDefinition[] = [
  {
    id: "scenario-01-thermal",
    slug: "thermal-excursion",
    name: "Thermal Excursion",
    shortName: "Thermal",
    difficulty: "Beginner",
    category: "thermal",
    riskLevel: "Medium",
    modelIds: ["simulator-chaotic-spindle", "thermal-heat-field-reactor"],
    beginnerSummary: "Coolant is getting too warm. The machine may expand slightly from heat, which can affect part accuracy. The simulator will show how the system detects this and asks a human before taking any action.",
    technicalSummary: "Coolant temperature rises from 20.6 °C to 31.8 °C over the simulated run, causing Z-axis thermal drift and a modeled Cpk degradation risk. The advisory engine recommends thermal offset compensation with operator approval and shadow-mode validation.",
    incidentSeed: { name: "Coolant Loop Restriction", description: "Injects a flow restriction causing gradual thermal rise.", delaySeconds: 5 },
    signals: [
      {
        id: "sig-temp", name: "Coolant Temperature", unit: "°C", baseline: 20.6, watchThreshold: 25.0, warningThreshold: 28.0, criticalThreshold: 32.0, noiseAmplitude: 0.2, rampRate: 30, incidentMagnitude: 11.2
      },
      {
        id: "sig-cpk", name: "Process Cpk", unit: "index", baseline: 1.66, watchThreshold: 1.33, warningThreshold: 1.0, criticalThreshold: 0.8, noiseAmplitude: 0.05, rampRate: 40, incidentMagnitude: -0.6
      }
    ],
    evidencePlan: [mockEvidenceCorpus[0], mockEvidenceCorpus[2]],
    recommendations: [
      { id: "rec-1", text: "Apply Thermal Offset Compensation", rationale: "SOP-0456 supports thermal offset review when Z-axis drift exceeds +1.5 µm and coolant temperature rises above the watch threshold.", confidence: 0.92, requiresApproval: true, shadowActionAvailable: true }
    ],
    tutorialHints: [
      { target: "IncidentSeeder", message: "Seeding an incident starts the simulated problem. This is like pressing play on a training case." },
      { target: "OperatorDecisionPanel", message: "A human must approve risky actions. This keeps the workflow operator-safe." }
    ]
  },
  {
    id: "scenario-02-vibration",
    slug: "spindle-degradation",
    name: "Spindle Degradation",
    shortName: "Vibration",
    difficulty: "Intermediate",
    category: "vibration",
    riskLevel: "High",
    modelIds: ["simulator-chaotic-spindle", "vibration-resonance-tunnel"],
    beginnerSummary: "The main spindle is vibrating more than usual, suggesting a bearing might be failing. We need to reduce speed to save the part and schedule maintenance.",
    technicalSummary: "Vibration RMS crosses the 4.5 mm/s warning threshold, indicating potential bearing instability. The system proposes a process parameter adjustment (feed reduction) in shadow mode, requiring explicit operator approval.",
    incidentSeed: { name: "Bearing Cage Instability", description: "Injects a high-frequency chatter resonance.", delaySeconds: 8 },
    signals: [
      {
        id: "sig-vib", name: "Vibration RMS", unit: "mm/s", baseline: 1.2, watchThreshold: 2.8, warningThreshold: 4.5, criticalThreshold: 7.1, noiseAmplitude: 0.4, rampRate: 15, incidentMagnitude: 5.5
      }
    ],
    evidencePlan: [mockEvidenceCorpus[1]],
    recommendations: [
      { id: "rec-2", text: "Reduce Feed Rate & Schedule Inspection", rationale: "MM-207 advises feed reduction to mitigate bearing chatter until a physical inspection can be completed.", confidence: 0.85, requiresApproval: true, shadowActionAvailable: true }
    ]
  },
  {
    id: "scenario-07-security",
    slug: "cyber-anomalous-command",
    name: "Cyber-Anomalous Command Pattern",
    shortName: "Security",
    difficulty: "Advanced",
    category: "security",
    riskLevel: "Critical",
    modelIds: ["governance-protective-shield", "ledger-blockchain-cube-grid"],
    beginnerSummary: "An unexpected network command tries to access the machine directly. The Governance Shield blocks it because no AI or network agent is allowed to directly control physical hardware without human approval.",
    technicalSummary: "An anomalous process sequence triggers a zero-trust policy gate (SEC-209). The orchestrator blocks the execution path, quarantines the session, and generates an immutable ledger hash for forensic replay.",
    incidentSeed: { name: "Unauthorized Write Request", description: "Simulates an external command attempting a direct PLC register write.", delaySeconds: 3 },
    signals: [
      {
        id: "sig-sec", name: "Anomaly Score", unit: "index", baseline: 0.05, watchThreshold: 0.5, warningThreshold: 0.8, criticalThreshold: 0.95, noiseAmplitude: 0.02, rampRate: 2, incidentMagnitude: 0.92
      }
    ],
    evidencePlan: [mockEvidenceCorpus[3]],
    recommendations: [
      { id: "rec-3", text: "Quarantine Session & Block Execution", rationale: "SEC-209 strictly prohibits direct PLC actuation without cryptographically signed operator shadowing.", confidence: 0.99, requiresApproval: false, shadowActionAvailable: false }
    ]
  }
];
