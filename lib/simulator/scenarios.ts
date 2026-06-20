import { TwinScenarioDefinition, EvidenceSource } from "./types";

const mockEvidenceCorpus: EvidenceSource[] = [
  {
    id: "LO-2024",
    title: "Digital Twins in Smart Manufacturing (Lo, 2024)",
    type: "policy",
    summary: "Enforces deterministic shadow-mode execution. Virtual simulations must not retain direct write-access to physical PLC actuators during testing.",
    appliesToScenarios: ["thermal", "compound"],
    confidence: 1.0,
    approved: true,
    lastUpdated: "2024-11-12T08:00:00Z",
    simulatedHash: "0x8fae29c...",
  },
  {
    id: "WANG-2025",
    title: "Double-Edge Computation Offloading (Wang, 2025)",
    type: "procedure",
    summary: "Guidelines for hierarchical workload distribution. High-frequency anomaly inferences are offloaded from the primary sensor edge to the secondary compute edge.",
    appliesToScenarios: ["vibration", "compound"],
    confidence: 0.98,
    approved: true,
    lastUpdated: "2025-06-01T14:30:00Z",
    simulatedHash: "0x3b1c90a...",
  },
  {
    id: "CHEN-2024",
    title: "Event Sourcing in IIoT Data Lakes (Chen, 2024)",
    type: "document",
    summary: "Mandates append-only immutability. Rejects UPDATE or DELETE operations on live telemetry to prevent race conditions during high-volume bursts.",
    appliesToScenarios: ["quality", "compound"],
    confidence: 1.0,
    approved: true,
    lastUpdated: "2024-01-10T09:15:00Z",
    simulatedHash: "0x55ff11e...",
  },
  {
    id: "OSHA-DLT",
    title: "Blockchain-based Log Auditing (Anon, 2025)",
    type: "policy",
    summary: "Zero-Trust Anchoring Policy. Critical safety interlock bypasses must be cryptographically hashed and anchored to a public EVM ledger for immediate compliance auditing.",
    appliesToScenarios: ["security", "compound"],
    confidence: 1.0,
    approved: true,
    lastUpdated: "2025-05-20T10:00:00Z",
    simulatedHash: "0x99aa88b...",
  },
  {
    id: "RECURSIVE-CTX",
    title: "Context Engineering for LLMs (Anon, 2025)",
    type: "procedure",
    summary: "Reflex Memory Protocol. Autonomous agents must query semantic memory for past failure states before dispatching baseline process parameters.",
    appliesToScenarios: ["recursive", "compound"],
    confidence: 0.95,
    approved: true,
    lastUpdated: "2025-07-15T10:00:00Z",
    simulatedHash: "0x44bb77c...",
  }
];

export const SCENARIOS: TwinScenarioDefinition[] = [
  {
    id: "scenario-01-deterministic-sync",
    slug: "deterministic-shadow-mode",
    name: "Module 1: Deterministic Shadow Mode",
    shortName: "Shadow Mode",
    difficulty: "Beginner",
    category: "thermal",
    riskLevel: "Medium",
    modelIds: ["simulator-chaotic-spindle", "thermal-heat-field-reactor"],
    beginnerSummary: "A severe thermal excursion occurs. Instead of reacting physically, the system boots a WebGL shadow-twin to simulate thermal offset compensation safely before recommending a patch. (Lo, 2024)",
    technicalSummary: "Coolant temperature spikes, risking physical part deformation. The agent adheres to LO-2024 by enforcing a strict read-only boundary, simulating the thermal offset in WebGL space rather than actuating the physical ball screws.",
    incidentSeed: { name: "Thermal Excursion", description: "Injects rapid heat buildup in the Z-axis casting.", delaySeconds: 3 },
    signals: [
      { id: "sig-temp", name: "Spindle Casting Temp", unit: "°C", baseline: 22.0, watchThreshold: 26.0, warningThreshold: 30.0, criticalThreshold: 35.0, noiseAmplitude: 0.1, rampRate: 40, incidentMagnitude: 14.5 }
    ],
    evidencePlan: [mockEvidenceCorpus[0]],
    recommendations: [
      { id: "rec-1", text: "Simulate Thermal Offset (+0.02mm)", rationale: "LO-2024 Policy enforced. Simulating dynamic offset in the cyber-domain. Awaiting operator validation before physical actuation.", confidence: 0.99, requiresApproval: true, shadowActionAvailable: true }
    ],
    tutorialHints: [
      { target: "IncidentSeeder", message: "Injecting the thermal anomaly. Watch the WebGL twin react without affecting the physical layer." }
    ]
  },
  {
    id: "scenario-02-double-edge",
    slug: "double-edge-offloading",
    name: "Module 2: Double-Edge Offloading",
    shortName: "MEC Offload",
    difficulty: "Intermediate",
    category: "vibration",
    riskLevel: "High",
    modelIds: ["simulator-chaotic-spindle", "vibration-resonance-tunnel"],
    beginnerSummary: "A high-frequency vibration anomaly overwhelms the local PLC. The scenario simulates offloading the heavy predictive analytics to the secondary edge (our Next.js node). (Wang, 2025)",
    technicalSummary: "Vibration RMS crosses 5.0 mm/s. The primary edge (sensor array) lacks compute overhead for spectral analysis, so the data is hierarchical offloaded to the secondary MEC node, which returns a feed reduction payload in <10ms.",
    incidentSeed: { name: "High-Freq Resonance", description: "Injects overwhelming chatter data volume.", delaySeconds: 4 },
    signals: [
      { id: "sig-vib", name: "Vibration RMS", unit: "mm/s", baseline: 1.2, watchThreshold: 2.8, warningThreshold: 4.5, criticalThreshold: 7.1, noiseAmplitude: 0.4, rampRate: 15, incidentMagnitude: 5.5 }
    ],
    evidencePlan: [mockEvidenceCorpus[1]],
    recommendations: [
      { id: "rec-2", text: "MEC Offload: Reduce Feed 15%", rationale: "WANG-2025 Protocol active. Secondary edge compute has analyzed the spectral density and recommends immediate feed rate scaling.", confidence: 0.96, requiresApproval: true, shadowActionAvailable: true }
    ],
    tutorialHints: []
  },
  {
    id: "scenario-03-event-sourcing",
    slug: "immutable-event-burst",
    name: "Module 3: IIoT Event Sourcing",
    shortName: "Data Burst",
    difficulty: "Intermediate",
    category: "quality",
    riskLevel: "Medium",
    modelIds: ["qa-inspection-torus"],
    beginnerSummary: "A massive spike of concurrent telemetry events hits the system. Demonstrates how append-only Postgres logs handle the burst without data mutation or locking. (Chen, 2024)",
    technicalSummary: "Simulates 10,000 concurrent sensor writes. Instead of updating a single state row (causing race conditions), the architecture uses Event Sourcing (CHEN-2024), writing immutable logs that the UI aggregates asynchronously.",
    incidentSeed: { name: "Telemetry Flood", description: "Injects massive burst of concurrent state events.", delaySeconds: 2 },
    signals: [
      { id: "sig-tps", name: "Transactions Per Sec", unit: "TPS", baseline: 50, watchThreshold: 200, warningThreshold: 500, criticalThreshold: 1000, noiseAmplitude: 10, rampRate: 2000, incidentMagnitude: 1200 }
    ],
    evidencePlan: [mockEvidenceCorpus[2]],
    recommendations: [
      { id: "rec-3", text: "Aggregate Immutable State", rationale: "CHEN-2024 Enforced. No database locks detected. RLS policies successfully appended all events chronologically.", confidence: 1.0, requiresApproval: false, shadowActionAvailable: false }
    ],
    tutorialHints: []
  },
  {
    id: "scenario-04-blockchain-audit",
    slug: "dlt-zero-trust-anchor",
    name: "Module 4: DLT Zero-Trust Anchoring",
    shortName: "DLT Anchor",
    difficulty: "Advanced",
    category: "security",
    riskLevel: "Critical",
    modelIds: ["governance-protective-shield", "ledger-blockchain-cube-grid"],
    beginnerSummary: "A critical safety interlock is bypassed. The system immediately generates a deterministic SHA-256 hash of the violation and cues an anchor to the EVM for OSHA compliance. (Anon, 2025)",
    technicalSummary: "An operator physically bypasses the safety door interlock during a live M03 spindle cycle. The system halts the machine, canonicalizes the telemetry, and generates an EvidencePacket to be cryptographically burned to the blockchain.",
    incidentSeed: { name: "Door Interlock Bypass", description: "Simulates physical door open during active machining.", delaySeconds: 3 },
    signals: [
      { id: "sig-door", name: "Interlock Integrity", unit: "status", baseline: 1, watchThreshold: 0.8, warningThreshold: 0.5, criticalThreshold: 0.1, noiseAmplitude: 0, rampRate: 1, incidentMagnitude: -1 }
    ],
    evidencePlan: [mockEvidenceCorpus[3]],
    recommendations: [
      { id: "rec-4", text: "Emergency E-Stop & Hash Anchor", rationale: "OSHA-DLT Protocol triggered. Catastrophic safety violation. Spindle halted and cryptographically signed telemetry hash staged for Hedera/XRPL broadcast.", confidence: 1.0, requiresApproval: true, shadowActionAvailable: false }
    ],
    tutorialHints: []
  },
  {
    id: "scenario-05-recursive-memory",
    slug: "recursive-sentient-memory",
    name: "Module 5: Recursive Sentient Memory",
    shortName: "Recursive AI",
    difficulty: "Advanced",
    category: "recursive",
    riskLevel: "Critical",
    modelIds: ["advisory-icosahedron-core", "vibration-resonance-tunnel"],
    beginnerSummary: "The AI suggests a baseline reduction. If you run this scenario a second time, the AI queries its semantic memory, realizing the previous fix failed, and preemptively halts the machine instead! (Anon, 2025)",
    technicalSummary: "Demonstrates RECURSIVE-CTX Context Engineering. The first execution attempts a feed micro-adjustment and writes a Reflex Memory. If triggered again, the agent intercepts the RAG pipeline, overriding the baseline logic.",
    incidentSeed: { name: "Progressive Bearing Wear", description: "Injects progressive high-frequency chatter.", delaySeconds: 3 },
    signals: [
      { id: "sig-vib-rec", name: "Bearing Chatter", unit: "g", baseline: 0.5, watchThreshold: 1.5, warningThreshold: 3.0, criticalThreshold: 5.0, noiseAmplitude: 0.2, rampRate: 10, incidentMagnitude: 4.8 }
    ],
    evidencePlan: [mockEvidenceCorpus[1], mockEvidenceCorpus[4]],
    recommendations: [
      { id: "rec-5-baseline", text: "Apply Dynamic Feed Reduction", rationale: "Vibration threshold exceeded. A dynamic edge automation will attempt to govern feed rates. (Baseline Memory)", confidence: 0.85, requiresApproval: true, shadowActionAvailable: true }
    ],
    tutorialHints: [
      { target: "OperatorDecisionPanel", message: "Approving this action writes a memory. Run this scenario again to see the AI learn from this memory." }
    ]
  }
];