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
,
  {
    id: "scenario-04-coolant",
    slug: "coolant-starvation",
    name: "Coolant Starvation",
    shortName: "Coolant",
    difficulty: "Beginner",
    category: "thermal",
    riskLevel: "High",
    modelIds: ["thermal-heat-field-reactor"],
    beginnerSummary: "Coolant flow rate drops suddenly, risking immediate tool failure.",
    technicalSummary: "Flow meter detects < 10L/min. System proposes emergency M05 spindle stop.",
    incidentSeed: { name: "Pump Intake Blockage", description: "Simulates sudden drop in coolant pressure and flow.", delaySeconds: 3 },
    signals: [
      {
            "id": "sig-flow",
            "name": "Coolant Flow Rate",
            "unit": "L/min",
            "baseline": 45,
            "watchThreshold": 35,
            "warningThreshold": 20,
            "criticalThreshold": 10,
            "noiseAmplitude": 2.5,
            "rampRate": 5,
            "incidentMagnitude": -38
      }
    ],
    evidencePlan: [mockEvidenceCorpus[0]],
    recommendations: [
      {
            "id": "rec-coolant",
            "text": "Emergency M05 Spindle Stop",
            "rationale": "Flow < 10L/min detected. Immediate stop required to prevent catastrophic tool thermal shock.",
            "confidence": 0.99,
            "requiresApproval": true,
            "shadowActionAvailable": true
      }
    ],
    tutorialHints: []
  },
  {
    id: "scenario-05-toolwear",
    slug: "tool-edge-fracture",
    name: "Micro-Fractured Tool Edge",
    shortName: "Tooling",
    difficulty: "Intermediate",
    category: "tooling",
    riskLevel: "Medium",
    modelIds: ["tool-wear-eroding-edge"],
    beginnerSummary: "The cutting tool has chipped slightly, causing poor surface finish.",
    technicalSummary: "Acoustic emission spikes detect micro-fracture. System flags tool change.",
    incidentSeed: { name: "Inclusion Strike", description: "Simulates striking a hard material inclusion.", delaySeconds: 3 },
    signals: [
      {
            "id": "sig-ae",
            "name": "Acoustic Emission",
            "unit": "kHz",
            "baseline": 120,
            "watchThreshold": 180,
            "warningThreshold": 250,
            "criticalThreshold": 350,
            "noiseAmplitude": 15,
            "rampRate": 2,
            "incidentMagnitude": 240
      }
    ],
    evidencePlan: [mockEvidenceCorpus[1]],
    recommendations: [
      {
            "id": "rec-tool",
            "text": "Trigger Auto Tool Change (M06)",
            "rationale": "High-frequency acoustic spike matches signature of insert micro-fracture. Tool life expired.",
            "confidence": 0.94,
            "requiresApproval": true,
            "shadowActionAvailable": true
      }
    ],
    tutorialHints: []
  },
  {
    id: "scenario-06-servo",
    slug: "servo-following-error",
    name: "Servo Following Error",
    shortName: "Servo",
    difficulty: "Intermediate",
    category: "vibration",
    riskLevel: "High",
    modelIds: ["simulator-chaotic-spindle"],
    beginnerSummary: "Axis motors are struggling to keep up with the commanded path.",
    technicalSummary: "Following error exceeds 0.05mm during rapid traverse. Proposes gain tuning.",
    incidentSeed: { name: "Axis Bind", description: "Injects simulated friction into ball screw model.", delaySeconds: 3 },
    signals: [
      {
            "id": "sig-servo",
            "name": "Y-Axis Following Error",
            "unit": "mm",
            "baseline": 0.005,
            "watchThreshold": 0.02,
            "warningThreshold": 0.05,
            "criticalThreshold": 0.1,
            "noiseAmplitude": 0.002,
            "rampRate": 10,
            "incidentMagnitude": 0.06
      }
    ],
    evidencePlan: [mockEvidenceCorpus[2]],
    recommendations: [
      {
            "id": "rec-servo",
            "text": "Apply Dynamic Gain Tuning",
            "rationale": "Friction variance detected in Y-axis ball screw. Dynamic feed-forward gain adjustment required.",
            "confidence": 0.88,
            "requiresApproval": true,
            "shadowActionAvailable": true
      }
    ],
    tutorialHints: []
  },
  {
    id: "scenario-07-power",
    slug: "voltage-sag",
    name: "Facility Voltage Sag",
    shortName: "Power",
    difficulty: "Beginner",
    category: "energy",
    riskLevel: "Medium",
    modelIds: ["supply-chain-flow-network"],
    beginnerSummary: "Incoming power drops briefly, causing control electronics to stumble.",
    technicalSummary: "3-phase voltage drops below 380V. System captures state for soft recovery.",
    incidentSeed: { name: "Grid Fluctuation", description: "Simulates 150ms 20% voltage sag.", delaySeconds: 3 },
    signals: [
      {
            "id": "sig-volt",
            "name": "Mains L1-L2 Voltage",
            "unit": "V",
            "baseline": 480,
            "watchThreshold": 450,
            "warningThreshold": 420,
            "criticalThreshold": 380,
            "noiseAmplitude": 5,
            "rampRate": 1,
            "incidentMagnitude": -110
      }
    ],
    evidencePlan: [mockEvidenceCorpus[3]],
    recommendations: [
      {
            "id": "rec-power",
            "text": "Engage Soft-Recovery Routine",
            "rationale": "Under-voltage event recorded. Drives must execute controlled deceleration to preserve part.",
            "confidence": 0.97,
            "requiresApproval": true,
            "shadowActionAvailable": true
      }
    ],
    tutorialHints: []
  },
  {
    id: "scenario-08-quality",
    slug: "cpk-drift",
    name: "Gradual Cpk Drift",
    shortName: "Quality",
    difficulty: "Advanced",
    category: "quality",
    riskLevel: "Medium",
    modelIds: ["qa-inspection-torus"],
    beginnerSummary: "Part sizes are slowly creeping toward the upper tolerance limit.",
    technicalSummary: "Cpk trend analysis predicts violation in 50 parts. Recommends tool wear offset.",
    incidentSeed: { name: "Thermal Expansion", description: "Injects gradual diameter increase.", delaySeconds: 3 },
    signals: [
      {
            "id": "sig-dim",
            "name": "Bore Diameter",
            "unit": "mm",
            "baseline": 25,
            "watchThreshold": 25.015,
            "warningThreshold": 25.02,
            "criticalThreshold": 25.025,
            "noiseAmplitude": 0.002,
            "rampRate": 600,
            "incidentMagnitude": 0.022
      }
    ],
    evidencePlan: [mockEvidenceCorpus[0]],
    recommendations: [
      {
            "id": "rec-cpk",
            "text": "Inject Wear Offset (-0.02mm)",
            "rationale": "Linear growth in bore dimension correlates with insert flank wear. Apply macro wear offset.",
            "confidence": 0.91,
            "requiresApproval": true,
            "shadowActionAvailable": true
      }
    ],
    tutorialHints: []
  },
  {
    id: "scenario-09-lubrication",
    slug: "way-lube-empty",
    name: "Way Lube Exhausted",
    shortName: "Lube",
    difficulty: "Beginner",
    category: "sensor",
    riskLevel: "Low",
    modelIds: ["simulator-chaotic-spindle"],
    beginnerSummary: "Machine has run out of slideway oil.",
    technicalSummary: "Float switch detects empty reservoir. System halts cycle start until refilled.",
    incidentSeed: { name: "Empty Tank", description: "Simulates tank level falling below threshold.", delaySeconds: 3 },
    signals: [
      {
            "id": "sig-lube",
            "name": "Lube Tank Level",
            "unit": "%",
            "baseline": 45,
            "watchThreshold": 15,
            "warningThreshold": 5,
            "criticalThreshold": 1,
            "noiseAmplitude": 0.5,
            "rampRate": 50,
            "incidentMagnitude": -44
      }
    ],
    evidencePlan: [mockEvidenceCorpus[1]],
    recommendations: [
      {
            "id": "rec-lube",
            "text": "Block M30 Cycle Restart",
            "rationale": "Way lube depleted. Cycle start must be inhibited to prevent severe guideway scoring.",
            "confidence": 1,
            "requiresApproval": true,
            "shadowActionAvailable": true
      }
    ],
    tutorialHints: []
  },
  {
    id: "scenario-10-collision",
    slug: "mild-collision",
    name: "Mild Z-Axis Collision",
    shortName: "Collision",
    difficulty: "Advanced",
    category: "vibration",
    riskLevel: "Critical",
    modelIds: ["vibration-resonance-tunnel"],
    beginnerSummary: "Tool bumped the fixture, requiring immediate inspection.",
    technicalSummary: "Spindle load spikes to 150% in 10ms. Emergency stop triggered, requires structural verification.",
    incidentSeed: { name: "Offset Error", description: "Simulates tool length offset discrepancy.", delaySeconds: 3 },
    signals: [
      {
            "id": "sig-load",
            "name": "Z-Axis Motor Load",
            "unit": "%",
            "baseline": 15,
            "watchThreshold": 50,
            "warningThreshold": 100,
            "criticalThreshold": 140,
            "noiseAmplitude": 2,
            "rampRate": 1,
            "incidentMagnitude": 135
      }
    ],
    evidencePlan: [mockEvidenceCorpus[2]],
    recommendations: [
      {
            "id": "rec-collision",
            "text": "Emergency E-Stop & Quarantine",
            "rationale": "Catastrophic load spike detected in Z-axis. Immediate halt and metrology recalibration required.",
            "confidence": 0.99,
            "requiresApproval": true,
            "shadowActionAvailable": false
      }
    ],
    tutorialHints: []
  },
  {
    id: "scenario-11-network",
    slug: "mqtt-latency",
    name: "High MQTT Latency",
    shortName: "Network",
    difficulty: "Intermediate",
    category: "security",
    riskLevel: "Medium",
    modelIds: ["governance-protective-shield"],
    beginnerSummary: "Data from the machine is delayed reaching the cloud.",
    technicalSummary: "Packet ping exceeds 500ms. System transitions to edge-only autonomous mode.",
    incidentSeed: { name: "Switch Congestion", description: "Injects artificial network jitter and latency.", delaySeconds: 3 },
    signals: [
      {
            "id": "sig-ping",
            "name": "MQTT Broker Latency",
            "unit": "ms",
            "baseline": 12,
            "watchThreshold": 100,
            "warningThreshold": 300,
            "criticalThreshold": 500,
            "noiseAmplitude": 8,
            "rampRate": 15,
            "incidentMagnitude": 520
      }
    ],
    evidencePlan: [mockEvidenceCorpus[3]],
    recommendations: [
      {
            "id": "rec-network",
            "text": "Transition to Edge-Local Governance",
            "rationale": "Cloud uplink unstable. Failsafe routing requires falling back to local isolated AI processing.",
            "confidence": 0.85,
            "requiresApproval": true,
            "shadowActionAvailable": true
      }
    ],
    tutorialHints: []
  },
  {
    id: "scenario-12-air",
    slug: "pneumatic-pressure",
    name: "Low Pneumatic Pressure",
    shortName: "Pneumatic",
    difficulty: "Beginner",
    category: "sensor",
    riskLevel: "High",
    modelIds: ["simulator-chaotic-spindle"],
    beginnerSummary: "Air pressure dropping, parts might not unclamp.",
    technicalSummary: "System pressure drops below 60 PSI. Proposes controlled cycle abort.",
    incidentSeed: { name: "Compressor Trip", description: "Simulates slow loss of shop air.", delaySeconds: 3 },
    signals: [
      {
            "id": "sig-air",
            "name": "Main Air Pressure",
            "unit": "PSI",
            "baseline": 90,
            "watchThreshold": 75,
            "warningThreshold": 65,
            "criticalThreshold": 55,
            "noiseAmplitude": 1,
            "rampRate": 40,
            "incidentMagnitude": -38
      }
    ],
    evidencePlan: [mockEvidenceCorpus[0]],
    recommendations: [
      {
            "id": "rec-air",
            "text": "Controlled Feed Hold",
            "rationale": "Pneumatic pressure falling. Machine must hold feed before ATC or chuck actuation fails.",
            "confidence": 0.96,
            "requiresApproval": true,
            "shadowActionAvailable": true
      }
    ],
    tutorialHints: []
  },
  {
    id: "scenario-13-chip",
    slug: "chip-conveyor-jam",
    name: "Chip Conveyor Jam",
    shortName: "Conveyor",
    difficulty: "Beginner",
    category: "sensor",
    riskLevel: "Low",
    modelIds: ["supply-chain-flow-network"],
    beginnerSummary: "Metal chips are tangled and jammed in the conveyor.",
    technicalSummary: "Conveyor motor current exceeds limit. Proposes auto-reverse cycle.",
    incidentSeed: { name: "Stringy Chips", description: "Simulates mechanical bind in conveyor chain.", delaySeconds: 3 },
    signals: [
      {
            "id": "sig-conveyor",
            "name": "Conveyor Motor Current",
            "unit": "A",
            "baseline": 1.5,
            "watchThreshold": 3,
            "warningThreshold": 4.5,
            "criticalThreshold": 6,
            "noiseAmplitude": 0.2,
            "rampRate": 10,
            "incidentMagnitude": 5.5
      }
    ],
    evidencePlan: [mockEvidenceCorpus[1]],
    recommendations: [
      {
            "id": "rec-chip",
            "text": "Execute Auto-Reverse Unjam",
            "rationale": "Overcurrent on chip auger. A 3-second reverse cycle will clear the stringy chip bundle.",
            "confidence": 0.93,
            "requiresApproval": true,
            "shadowActionAvailable": true
      }
    ],
    tutorialHints: []
  },
  {
    id: "scenario-14-chiller",
    slug: "chiller-fault",
    name: "Spindle Chiller Fault",
    shortName: "Chiller",
    difficulty: "Intermediate",
    category: "thermal",
    riskLevel: "High",
    modelIds: ["thermal-heat-field-reactor"],
    beginnerSummary: "The refrigerator unit for the spindle has an error code.",
    technicalSummary: "Modbus alerts fault code 44. Spindle max RPM clamped to 20%.",
    incidentSeed: { name: "Freon Leak", description: "Simulates loss of cooling capacity.", delaySeconds: 3 },
    signals: [
      {
            "id": "sig-chiller",
            "name": "Chiller Error Code",
            "unit": "code",
            "baseline": 0,
            "watchThreshold": 0.5,
            "warningThreshold": 0.5,
            "criticalThreshold": 40,
            "noiseAmplitude": 0,
            "rampRate": 1,
            "incidentMagnitude": 44
      }
    ],
    evidencePlan: [mockEvidenceCorpus[2]],
    recommendations: [
      {
            "id": "rec-chiller",
            "text": "Clamp Max RPM to 20%",
            "rationale": "Chiller failure requires severe spindle speed derating to prevent bearing seizure.",
            "confidence": 0.98,
            "requiresApproval": true,
            "shadowActionAvailable": true
      }
    ],
    tutorialHints: []
  },
  {
    id: "scenario-15-rag",
    slug: "missing-sop",
    name: "Missing SOP Context",
    shortName: "RAG",
    difficulty: "Advanced",
    category: "rag",
    riskLevel: "High",
    modelIds: ["rag-neural-knowledge-graph"],
    beginnerSummary: "A rare error occurs, and the AI cannot find the manual.",
    technicalSummary: "Retrieval score < 0.3 for anomaly. System refuses to generate action without human context.",
    incidentSeed: { name: "Obscure Alarm", description: "Injects undocumented OEM alarm code.", delaySeconds: 3 },
    signals: [
      {
            "id": "sig-rag",
            "name": "Knowledge Retrieval Score",
            "unit": "index",
            "baseline": 0.95,
            "watchThreshold": 0.6,
            "warningThreshold": 0.4,
            "criticalThreshold": 0.25,
            "noiseAmplitude": 0.02,
            "rampRate": 5,
            "incidentMagnitude": -0.75
      }
    ],
    evidencePlan: [mockEvidenceCorpus[3]],
    recommendations: [
      {
            "id": "rec-rag",
            "text": "Escalate to Tier 3 Engineering",
            "rationale": "No safe advisory can be generated. Vector search returned zero matching SOPs for this fault.",
            "confidence": 1,
            "requiresApproval": true,
            "shadowActionAvailable": false
      }
    ],
    tutorialHints: []
  },
  {
    id: "scenario-16-probe",
    slug: "probe-battery",
    name: "Probe Battery Low",
    shortName: "Metrology",
    difficulty: "Beginner",
    category: "sensor",
    riskLevel: "Medium",
    modelIds: ["qa-inspection-torus"],
    beginnerSummary: "The wireless measuring probe is about to die.",
    technicalSummary: "Optical receiver reports low battery. Warns operator to replace before next QA cycle.",
    incidentSeed: { name: "Battery Drain", description: "Simulates voltage drop on Renishaw probe.", delaySeconds: 3 },
    signals: [
      {
            "id": "sig-batt",
            "name": "OMP60 Battery Voltage",
            "unit": "V",
            "baseline": 3.6,
            "watchThreshold": 2.8,
            "warningThreshold": 2.5,
            "criticalThreshold": 2.2,
            "noiseAmplitude": 0.05,
            "rampRate": 200,
            "incidentMagnitude": -1.5
      }
    ],
    evidencePlan: [mockEvidenceCorpus[0]],
    recommendations: [
      {
            "id": "rec-probe",
            "text": "Bypass In-Machine Probing",
            "rationale": "Probe battery critical. Bypass macro G65 P9810 to prevent false-trigger measurement crashes.",
            "confidence": 0.91,
            "requiresApproval": true,
            "shadowActionAvailable": true
      }
    ],
    tutorialHints: []
  },
  {
    id: "scenario-17-encoder",
    slug: "encoder-noise",
    name: "Encoder Signal Noise",
    shortName: "Electrical",
    difficulty: "Advanced",
    category: "vibration",
    riskLevel: "Critical",
    modelIds: ["simulator-chaotic-spindle"],
    beginnerSummary: "Electrical interference is scrambling the motor position data.",
    technicalSummary: "Quadrature errors detected. Proposes grounding check and halts motion.",
    incidentSeed: { name: "EMI Interference", description: "Injects bit-flips into simulated encoder stream.", delaySeconds: 3 },
    signals: [
      {
            "id": "sig-enc",
            "name": "Quadrature Loss Events",
            "unit": "count",
            "baseline": 0,
            "watchThreshold": 5,
            "warningThreshold": 15,
            "criticalThreshold": 50,
            "noiseAmplitude": 1,
            "rampRate": 5,
            "incidentMagnitude": 60
      }
    ],
    evidencePlan: [mockEvidenceCorpus[1]],
    recommendations: [
      {
            "id": "rec-enc",
            "text": "Halt Motion & Inspect Grounding",
            "rationale": "Severe EMI causing encoder packet loss. Continued motion risks hard positional runaway.",
            "confidence": 0.99,
            "requiresApproval": true,
            "shadowActionAvailable": false
      }
    ],
    tutorialHints: []
  },
  {
    id: "scenario-18-door",
    slug: "interlock-bypass",
    name: "Interlock Bypass Attempt",
    shortName: "Safety",
    difficulty: "Beginner",
    category: "security",
    riskLevel: "Critical",
    modelIds: ["governance-protective-shield"],
    beginnerSummary: "Someone tried to open the door while the machine is running.",
    technicalSummary: "Door switch state mismatch. Safety relay trips, immutable event logged.",
    incidentSeed: { name: "Operator Override", description: "Simulates physical door open during cycle.", delaySeconds: 3 },
    signals: [
      {
            "id": "sig-door",
            "name": "Interlock Integrity",
            "unit": "status",
            "baseline": 1,
            "watchThreshold": 0.8,
            "warningThreshold": 0.5,
            "criticalThreshold": 0.1,
            "noiseAmplitude": 0,
            "rampRate": 1,
            "incidentMagnitude": -1
      }
    ],
    evidencePlan: [mockEvidenceCorpus[2]],
    recommendations: [
      {
            "id": "rec-door",
            "text": "Log OSHA Incident Hash",
            "rationale": "Door interlock overridden during active M03 cycle. Hard kill triggered. Logging to blockchain ledger.",
            "confidence": 1,
            "requiresApproval": false,
            "shadowActionAvailable": false
      }
    ],
    tutorialHints: []
  },
  {
    id: "scenario-19-barcode",
    slug: "invalid-lot",
    name: "Invalid Lot Barcode",
    shortName: "Traceability",
    difficulty: "Intermediate",
    category: "provenance",
    riskLevel: "Medium",
    modelIds: ["ledger-blockchain-cube-grid"],
    beginnerSummary: "The scanned material doesn't match the required work order.",
    technicalSummary: "ERP lookup fails for material lot. Blocks machining cycle start.",
    incidentSeed: { name: "Wrong Material", description: "Simulates scanning wrong routing sheet.", delaySeconds: 3 },
    signals: [
      {
            "id": "sig-erp",
            "name": "ERP Routing Match",
            "unit": "match",
            "baseline": 1,
            "watchThreshold": 0.5,
            "warningThreshold": 0.5,
            "criticalThreshold": 0.1,
            "noiseAmplitude": 0,
            "rampRate": 1,
            "incidentMagnitude": -1
      }
    ],
    evidencePlan: [mockEvidenceCorpus[3]],
    recommendations: [
      {
            "id": "rec-erp",
            "text": "Reject Pallet Load",
            "rationale": "Material lot hash does not match current ERP work order. Pallet rejected from load station.",
            "confidence": 1,
            "requiresApproval": true,
            "shadowActionAvailable": true
      }
    ],
    tutorialHints: []
  },
  {
    id: "scenario-20-filter",
    slug: "filter-clog",
    name: "Coolant Filter Clogged",
    shortName: "Maintenance",
    difficulty: "Beginner",
    category: "sensor",
    riskLevel: "Low",
    modelIds: ["supply-chain-flow-network"],
    beginnerSummary: "The coolant filter is dirty and needs changing.",
    technicalSummary: "Differential pressure across filter > 15 PSI. Schedules maintenance ticket.",
    incidentSeed: { name: "Sludge Buildup", description: "Simulates slow rise in DP sensor.", delaySeconds: 3 },
    signals: [
      {
            "id": "sig-dp",
            "name": "Filter Pressure Drop",
            "unit": "PSI",
            "baseline": 2,
            "watchThreshold": 8,
            "warningThreshold": 12,
            "criticalThreshold": 18,
            "noiseAmplitude": 0.5,
            "rampRate": 120,
            "incidentMagnitude": 17
      }
    ],
    evidencePlan: [mockEvidenceCorpus[0]],
    recommendations: [
      {
            "id": "rec-filter",
            "text": "Schedule CMMS Work Order",
            "rationale": "Filter DP high. Parts washing efficiency reduced. Generate automated maintenance ticket.",
            "confidence": 0.85,
            "requiresApproval": true,
            "shadowActionAvailable": true
      }
    ],
    tutorialHints: []
  },
  {
    id: "scenario-21-ai",
    slug: "hallucination-catch",
    name: "LLM Hallucination Caught",
    shortName: "Governance",
    difficulty: "Advanced",
    category: "rag",
    riskLevel: "High",
    modelIds: ["advisory-icosahedron-core"],
    beginnerSummary: "The AI suggested something physically impossible, and the safety shield blocked it.",
    technicalSummary: "Semantic physics engine rejects recommendation (e.g. S90000 on 10k spindle).",
    incidentSeed: { name: "Bad Generation", description: "Forces LLM to emit invalid G-code param.", delaySeconds: 3 },
    signals: [
      {
            "id": "sig-hall",
            "name": "Physics Violation Score",
            "unit": "index",
            "baseline": 0,
            "watchThreshold": 0.2,
            "warningThreshold": 0.5,
            "criticalThreshold": 0.9,
            "noiseAmplitude": 0.01,
            "rampRate": 2,
            "incidentMagnitude": 0.95
      }
    ],
    evidencePlan: [mockEvidenceCorpus[1]],
    recommendations: [
      {
            "id": "rec-hall",
            "text": "Veto Generated G-Code",
            "rationale": "Advisory generated Spindle Speed (90,000 RPM) exceeds machine physical limit (12,000 RPM). Vetoed by governance layer.",
            "confidence": 1,
            "requiresApproval": false,
            "shadowActionAvailable": false
      }
    ],
    tutorialHints: []
  },
  {
    id: "scenario-22-harmonic",
    slug: "chatter-harmonics",
    name: "Machining Chatter",
    shortName: "Acoustics",
    difficulty: "Intermediate",
    category: "vibration",
    riskLevel: "Medium",
    modelIds: ["vibration-resonance-tunnel"],
    beginnerSummary: "The part is screaming during the cut due to bad harmonics.",
    technicalSummary: "FFT detects peak at 400Hz. Proposes spindle speed variation (SSV).",
    incidentSeed: { name: "Thin Wall Resonance", description: "Simulates unstable cutting dynamics.", delaySeconds: 3 },
    signals: [
      {
            "id": "sig-fft",
            "name": "400Hz FFT Amplitude",
            "unit": "dB",
            "baseline": -60,
            "watchThreshold": -30,
            "warningThreshold": -15,
            "criticalThreshold": -5,
            "noiseAmplitude": 5,
            "rampRate": 10,
            "incidentMagnitude": 58
      }
    ],
    evidencePlan: [mockEvidenceCorpus[2]],
    recommendations: [
      {
            "id": "rec-harm",
            "text": "Activate Spindle Speed Variation",
            "rationale": "Regenerative chatter detected. Modulating spindle speed ±10% will break the resonant frequency.",
            "confidence": 0.92,
            "requiresApproval": true,
            "shadowActionAvailable": true
      }
    ],
    tutorialHints: []
  },
  {
    id: "scenario-23-warmup",
    slug: "cold-start",
    name: "Cold Start Compensation",
    shortName: "Thermal",
    difficulty: "Intermediate",
    category: "thermal",
    riskLevel: "Low",
    modelIds: ["thermal-heat-field-reactor"],
    beginnerSummary: "Machine just turned on and is physically cold, parts will be undersized.",
    technicalSummary: "Casting temp < 18C. Recommends warm-up cycle before production.",
    incidentSeed: { name: "Monday Morning", description: "Simulates system startup from ambient 15C.", delaySeconds: 3 },
    signals: [
      {
            "id": "sig-cast",
            "name": "Base Casting Temp",
            "unit": "°C",
            "baseline": 25,
            "watchThreshold": 20,
            "warningThreshold": 18,
            "criticalThreshold": 15,
            "noiseAmplitude": 0.1,
            "rampRate": 1,
            "incidentMagnitude": -10
      }
    ],
    evidencePlan: [mockEvidenceCorpus[3]],
    recommendations: [
      {
            "id": "rec-warm",
            "text": "Run O9000 Spindle Warm-up",
            "rationale": "Casting is cold. Executing a 15-minute kinematic warm-up prevents first-part dimensional scrap.",
            "confidence": 0.95,
            "requiresApproval": true,
            "shadowActionAvailable": true
      }
    ],
    tutorialHints: []
  },
  {
    id: "scenario-24-toolbreak",
    slug: "catastrophic-tool",
    name: "Catastrophic Tool Break",
    shortName: "Tooling",
    difficulty: "Beginner",
    category: "tooling",
    riskLevel: "Critical",
    modelIds: ["tool-wear-eroding-edge"],
    beginnerSummary: "The drill snapped inside the part.",
    technicalSummary: "Load drops instantly to zero. Macro interrupts and retracts to safe Z.",
    incidentSeed: { name: "Hard Spot", description: "Simulates sudden torque loss.", delaySeconds: 3 },
    signals: [
      {
            "id": "sig-torque",
            "name": "Spindle Torque",
            "unit": "%",
            "baseline": 65,
            "watchThreshold": 85,
            "warningThreshold": 10,
            "criticalThreshold": 5,
            "noiseAmplitude": 3,
            "rampRate": 1,
            "incidentMagnitude": -65
      }
    ],
    evidencePlan: [mockEvidenceCorpus[0]],
    recommendations: [
      {
            "id": "rec-break",
            "text": "Retract Z and Flag Part",
            "rationale": "Sudden loss of torque indicates catastrophic tool fracture. Retract to avoid spindle crash.",
            "confidence": 0.99,
            "requiresApproval": true,
            "shadowActionAvailable": false
      }
    ],
    tutorialHints: []
  },
  {
    id: "scenario-25-firmware",
    slug: "rogue-firmware",
    name: "Rogue Firmware Update",
    shortName: "Cyber",
    difficulty: "Advanced",
    category: "security",
    riskLevel: "Critical",
    modelIds: ["governance-protective-shield","ledger-blockchain-cube-grid"],
    beginnerSummary: "An unverified software update was detected over the network.",
    technicalSummary: "Hash mismatch on incoming OTA binary. Quarantines update.",
    incidentSeed: { name: "Supply Chain Attack", description: "Simulates malicious payload drop.", delaySeconds: 3 },
    signals: [
      {
            "id": "sig-fw",
            "name": "Firmware Hash Verification",
            "unit": "status",
            "baseline": 1,
            "watchThreshold": 0.5,
            "warningThreshold": 0.1,
            "criticalThreshold": 0,
            "noiseAmplitude": 0,
            "rampRate": 1,
            "incidentMagnitude": -1
      }
    ],
    evidencePlan: [mockEvidenceCorpus[1]],
    recommendations: [
      {
            "id": "rec-fw",
            "text": "Quarantine Firmware Payload",
            "rationale": "OTA signature does not match OEM public key. Update quarantined. Zero-trust policy enforced.",
            "confidence": 1,
            "requiresApproval": false,
            "shadowActionAvailable": false
      }
    ],
    tutorialHints: []
  },
  {
    id: "scenario-26-fire",
    slug: "fire-suppression",
    name: "Fire Suppression Active",
    shortName: "Safety",
    difficulty: "Beginner",
    category: "sensor",
    riskLevel: "Critical",
    modelIds: ["simulator-chaotic-spindle"],
    beginnerSummary: "Smoke detected in the enclosure.",
    technicalSummary: "CO2 system arms. System hard-kills all power and alerts fire team.",
    incidentSeed: { name: "Oil Mist Ignition", description: "Simulates UV/IR flame detector trip.", delaySeconds: 3 },
    signals: [
      {
            "id": "sig-fire",
            "name": "Enclosure Flame Sensor",
            "unit": "IR",
            "baseline": 0,
            "watchThreshold": 10,
            "warningThreshold": 50,
            "criticalThreshold": 100,
            "noiseAmplitude": 1,
            "rampRate": 2,
            "incidentMagnitude": 150
      }
    ],
    evidencePlan: [mockEvidenceCorpus[2]],
    recommendations: [
      {
            "id": "rec-fire",
            "text": "Discharge CO2 & Power Kill",
            "rationale": "Flame detected inside enclosure. Hard electrical isolation and fire suppression required.",
            "confidence": 1,
            "requiresApproval": false,
            "shadowActionAvailable": false
      }
    ],
    tutorialHints: []
  },
  {
    id: "scenario-27-data",
    slug: "data-lake-sync",
    name: "Data Lake Out of Sync",
    shortName: "Cloud",
    difficulty: "Intermediate",
    category: "provenance",
    riskLevel: "Low",
    modelIds: ["ledger-blockchain-cube-grid"],
    beginnerSummary: "The local database is out of sync with the cloud.",
    technicalSummary: "Hash chain fork detected. System rebuilds Merkle tree locally.",
    incidentSeed: { name: "Split Brain", description: "Simulates concurrent offline writes.", delaySeconds: 3 },
    signals: [
      {
            "id": "sig-sync",
            "name": "Ledger Divergence",
            "unit": "blocks",
            "baseline": 0,
            "watchThreshold": 5,
            "warningThreshold": 20,
            "criticalThreshold": 50,
            "noiseAmplitude": 0,
            "rampRate": 5,
            "incidentMagnitude": 65
      }
    ],
    evidencePlan: [mockEvidenceCorpus[3]],
    recommendations: [
      {
            "id": "rec-sync",
            "text": "Trigger Merkle Tree Rebuild",
            "rationale": "Local cache is out of sync with cloud ledger. Initiating deterministic state reconciliation.",
            "confidence": 0.9,
            "requiresApproval": true,
            "shadowActionAvailable": true
      }
    ],
    tutorialHints: []
  },
  {
    id: "scenario-28-hydraulic",
    slug: "chuck-pressure",
    name: "Low Chuck Pressure",
    shortName: "Hydraulic",
    difficulty: "Intermediate",
    category: "sensor",
    riskLevel: "High",
    modelIds: ["simulator-chaotic-spindle"],
    beginnerSummary: "The part isn't being gripped tightly enough.",
    technicalSummary: "Hydraulic pressure < 20 Bar. Prevents spindle start to avoid throwing part.",
    incidentSeed: { name: "Leaking Seal", description: "Simulates pressure bleed-off.", delaySeconds: 3 },
    signals: [
      {
            "id": "sig-hyd",
            "name": "Chuck Hydraulic Pressure",
            "unit": "Bar",
            "baseline": 40,
            "watchThreshold": 30,
            "warningThreshold": 25,
            "criticalThreshold": 15,
            "noiseAmplitude": 0.5,
            "rampRate": 15,
            "incidentMagnitude": -28
      }
    ],
    evidencePlan: [mockEvidenceCorpus[0]],
    recommendations: [
      {
            "id": "rec-hyd",
            "text": "Inhibit Spindle Rotation",
            "rationale": "Hydraulic pressure below safe grip threshold. Spinning up will throw the workpiece.",
            "confidence": 0.98,
            "requiresApproval": true,
            "shadowActionAvailable": false
      }
    ],
    tutorialHints: []
  },
  {
    id: "scenario-29-audit",
    slug: "iso-audit",
    name: "ISO 9001 Surprise Audit",
    shortName: "Compliance",
    difficulty: "Advanced",
    category: "provenance",
    riskLevel: "Low",
    modelIds: ["ledger-blockchain-cube-grid"],
    beginnerSummary: "An auditor wants to see the exact history of a specific part.",
    technicalSummary: "Trigger evidence retrieval pipeline. Pulls all hashed operator approvals.",
    incidentSeed: { name: "Auditor Request", description: "Simulates an external verification query.", delaySeconds: 3 },
    signals: [
      {
            "id": "sig-audit",
            "name": "Audit Query Load",
            "unit": "req/s",
            "baseline": 0.1,
            "watchThreshold": 5,
            "warningThreshold": 15,
            "criticalThreshold": 50,
            "noiseAmplitude": 0,
            "rampRate": 5,
            "incidentMagnitude": 60
      }
    ],
    evidencePlan: [mockEvidenceCorpus[1]],
    recommendations: [
      {
            "id": "rec-audit",
            "text": "Generate Hashed Evidence Packet",
            "rationale": "External audit requested. Compiling fully immutable operator decision ledger for ISO compliance.",
            "confidence": 0.99,
            "requiresApproval": true,
            "shadowActionAvailable": true
      }
    ],
    tutorialHints: []
  },
  {
    id: "scenario-30-compound",
    slug: "compound-cascade",
    name: "Cascading Failure",
    shortName: "Compound",
    difficulty: "Advanced",
    category: "compound",
    riskLevel: "Critical",
    modelIds: ["vibration-resonance-tunnel","thermal-heat-field-reactor","governance-protective-shield"],
    beginnerSummary: "Vibration causes heat, heat causes tool wear, and the network drops.",
    technicalSummary: "Multi-variate anomaly. Tests holistic system prioritization logic.",
    incidentSeed: { name: "The Perfect Storm", description: "Injects multiple interacting degradation vectors.", delaySeconds: 3 },
    signals: [
      {
            "id": "sig-comp1",
            "name": "Vibration RMS",
            "unit": "mm/s",
            "baseline": 1.2,
            "watchThreshold": 2.5,
            "warningThreshold": 4,
            "criticalThreshold": 6,
            "noiseAmplitude": 0.5,
            "rampRate": 20,
            "incidentMagnitude": 5.8
      },
      {
            "id": "sig-comp2",
            "name": "Spindle Temp",
            "unit": "°C",
            "baseline": 35,
            "watchThreshold": 50,
            "warningThreshold": 65,
            "criticalThreshold": 85,
            "noiseAmplitude": 1,
            "rampRate": 30,
            "incidentMagnitude": 55
      }
    ],
    evidencePlan: [mockEvidenceCorpus[2]],
    recommendations: [
      {
            "id": "rec-comp",
            "text": "Execute Multi-System Safestate",
            "rationale": "Compound degradation detected across 3 distinct vectors. Immediate unified safestate required.",
            "confidence": 0.89,
            "requiresApproval": true,
            "shadowActionAvailable": false
      }
    ],
    tutorialHints: []
  }
];