export type StatusKind =
  | "ready"
  | "review"
  | "simulated"
  | "approval"
  | "locked"
  | "testnet"
  | "advisory";

export type MissionArea = {
  id: string;
  index: string;
  title: string;
  descriptor: string;
  icon: string;
  href: string;
  status: StatusKind;
};

export type Kpi = {
  label: string;
  value: string;
  delta: string;
  status: StatusKind;
  detail: string;
};

export type RoadmapStep = {
  phase: string;
  horizon: string;
  title: string;
  detail: string;
  proof: string;
  status: StatusKind;
};

export type GovernanceItem = {
  title: string;
  control: string;
  evidence: string;
  status: StatusKind;
};

export type VendorLayer = {
  layer: string;
  standardsFirst: string;
  vendorLocked: string;
  recommendation: string;
};

export type EvidenceItem = {
  timestamp: string;
  source: string;
  event: string;
  payload: string;
  status: StatusKind;
};

export const missionAreas: MissionArea[] = [
  {
    id: "atlas-overview",
    index: "01",
    title: "Atlas Overview",
    descriptor: "Global operating shell",
    icon: "mission",
    href: "/",
    status: "ready"
  },
  {
    id: "ralphplan-ai",
    index: "02",
    title: "Ralphplan AI",
    descriptor: "Local cognitive retrieval lab",
    icon: "roadmap",
    href: "/rag",
    status: "review"
  },
  {
    id: "umattr",
    index: "03",
    title: "UMATTR",
    descriptor: "Commissioning intelligence studio",
    icon: "chart",
    href: "/iot-maker",
    status: "simulated"
  },
  {
    id: "chain-state-lab",
    index: "04",
    title: "Chain State Lab",
    descriptor: "Testnet proof anchors",
    icon: "hash",
    href: "/ledger",
    status: "testnet"
  },
  {
    id: "uranium-systems",
    index: "05",
    title: "Uranium Systems",
    descriptor: "Safety-first plant topology",
    icon: "power",
    href: "/governance",
    status: "locked"
  },
  {
    id: "uo2x",
    index: "06",
    title: "UO2X",
    descriptor: "Connected logistics intelligence",
    icon: "flow",
    href: "/simulator",
    status: "simulated"
  },
  {
    id: "digital-twin-architecture",
    index: "07",
    title: "Digital Twin Architecture",
    descriptor: "Cyber-physical map and replay",
    icon: "twin",
    href: "/simulator",
    status: "ready"
  },
  {
    id: "event-horizon-lab",
    index: "08",
    title: "Event Horizon Lab",
    descriptor: "Anomaly stream and memory",
    icon: "history",
    href: "/logs",
    status: "review"
  },
  {
    id: "app-systems",
    index: "09",
    title: "App Systems",
    descriptor: "Agent rail and workflow tools",
    icon: "stack",
    href: "/agents",
    status: "approval"
  },
  {
    id: "credentials",
    index: "10",
    title: "Credentials",
    descriptor: "Proof corpus and traceability",
    icon: "evidence",
    href: "/source",
    status: "ready"
  },
  {
    id: "source",
    index: "11",
    title: "Source / References",
    descriptor: "Architectural and protocol references",
    icon: "search",
    href: "/source",
    status: "review"
  },
  {
    id: "roadmap",
    index: "12",
    title: "AI Adoption Roadmap",
    descriptor: "Standards-first rollout",
    icon: "chart",
    href: "/roadmap",
    status: "review"
  },
  {
    id: "cognitive",
    index: "13",
    title: "Cognitive Swarm Brain",
    descriptor: "Live neural decision graph",
    icon: "twin",
    href: "/cognitive",
    status: "simulated"
  },
  {
    id: "kpis",
    index: "14",
    title: "KPI Dashboard",
    descriptor: "Executive signal board",
    icon: "chart",
    href: "/kpi",
    status: "simulated"
  },
  {
    id: "qa",
    index: "15",
    title: "QA Evidence Report",
    descriptor: "Verification packet",
    icon: "evidence",
    href: "/qa",
    status: "ready"
  }
];

export const overviewKpis: Kpi[] = [
  {
    label: "Knowledge retrieval coverage",
    value: "3 twin modes",
    delta: "9 seeded docs",
    status: "simulated",
    detail: "Approved quality, thermal, maintenance, operations, and compliance documents are now seeded across three deterministic twin scenarios."
  },
  {
    label: "Operator approval discipline",
    value: "100%",
    delta: "0 auto writes",
    status: "approval",
    detail: "Every suggested action remains advisory and requires explicit human approval."
  },
  {
    label: "Twin replay readiness",
    value: "3 scenarios",
    delta: "7 replay frames each",
    status: "review",
    detail: "Quality containment, thermal excursion, and spindle degradation now replay facility-to-system state across deterministic twin loops."
  },
  {
    label: "Evidence anchoring",
    value: "Local hash",
    delta: "Supabase-ready",
    status: "testnet",
    detail: "Evidence packets produce deterministic local hashes today and a Supabase schema is scaffolded for later persistence."
  }
];

export const roadmap: RoadmapStep[] = [
  {
    phase: "Phase 0",
    horizon: "Now",
    title: "Deterministic twin lab",
    detail:
      "Model multiple cyber-physical incidents from detection through evidence generation with operator-safe controls, replayable frames, and shadow system state.",
    proof: "Scenario launchpad, replay frames, approval flow, evidence packet",
    status: "ready"
  },
  {
    phase: "Phase 1",
    horizon: "Next",
    title: "Seeded RAG knowledge layer",
    detail:
      "Use approved engineering, maintenance, quality, and compliance documents to drive traceable recommendations and missing-context flags.",
    proof: "Retrieved source cards, lexical scoring, response summary",
    status: "simulated"
  },
  {
    phase: "Phase 2",
    horizon: "Next",
    title: "Twin replay and approval state machine",
    detail:
      "Replay risk signals across facility, line, cell, lab, QMS, MES, CMMS, and ledger nodes while enforcing advisory-first workflow transitions.",
    proof: "Replay frames, asset graph, subsystem telemetry, shadow writebacks, approval outcomes",
    status: "review"
  },
  {
    phase: "Phase 3",
    horizon: "Later",
    title: "Supabase-backed persistence",
    detail:
      "Persist runs, events, approvals, evidence packets, and knowledge documents behind a server-side persistence boundary.",
    proof: "Migration scaffold, environment contract, adapter boundary",
    status: "testnet"
  }
];

export const governanceItems: GovernanceItem[] = [
  {
    title: "Automation safety boundary",
    control: "Advisory-only operating mode",
    evidence: "No direct PLC, robot, furnace, grinder, lapper, or safety-system control is exposed in the simulator.",
    status: "locked"
  },
  {
    title: "Evidence privacy",
    control: "Hash-only provenance record",
    evidence: "Quality-hold evidence packets hash canonical JSON and avoid storing private payloads in any chain surface.",
    status: "testnet"
  },
  {
    title: "Model accountability",
    control: "Retrieved source trace",
    evidence: "Every recommendation is backed by approved corpus documents and explicit missing-context warnings.",
    status: "review"
  },
  {
    title: "Human approval",
    control: "Role-based review gate",
    evidence: "Approve, reject, and escalate are explicit user actions in the simulator workflow.",
    status: "approval"
  }
];

export const vendorLayers: VendorLayer[] = [
  {
    layer: "Equipment connectivity",
    standardsFirst: "OPC UA, MQTT/Sparkplug, and edge gateway abstraction",
    vendorLocked: "Single-vendor connector estate",
    recommendation: "Start with portable industrial standards to avoid plant-by-plant lock-in."
  },
  {
    layer: "Knowledge and RAG",
    standardsFirst: "Document registry, traceable retrieval, and approved corpus boundaries",
    vendorLocked: "Opaque chat-only assistant",
    recommendation: "Require source cards, failure banks, and deterministic retrieval before adding generation."
  },
  {
    layer: "Digital twin",
    standardsFirst: "Operational graph for machine, lot, lab, and risk states",
    vendorLocked: "Closed simulation with shallow lineage",
    recommendation: "Keep replay state portable and tied to evidence records."
  },
  {
    layer: "Provenance",
    standardsFirst: "Internal evidence registry plus optional external timestamp anchor",
    vendorLocked: "Audit history trapped in a single SaaS store",
    recommendation: "Hash only the evidence packet and keep governed payloads off-chain."
  }
];

export const overviewEvents: EvidenceItem[] = [
  {
    timestamp: "08:14",
    source: "Simulator Engine",
    event: "Twin scenario catalog active",
    payload: "Quality, thermal, and reliability incidents are available in the deterministic twin lab",
    status: "ready"
  },
  {
    timestamp: "08:19",
    source: "RAG Console",
    event: "Approved corpus retrieval trace",
    payload: "Quality, engineering, maintenance, and compliance sources ranked for review",
    status: "simulated"
  },
  {
    timestamp: "08:27",
    source: "Workflow Gate",
    event: "Operator approval required",
    payload: "Recommendation remains advisory until the review decision is recorded",
    status: "approval"
  },
  {
    timestamp: "08:35",
    source: "Twin Replay",
    event: "Cyber-physical frames assembled",
    payload: "Scenario-specific replay frames now map telemetry, governance state, and shadow writebacks",
    status: "review"
  },
  {
    timestamp: "08:41",
    source: "Provenance Service",
    event: "Evidence schema prepared",
    payload: "Local evidence hashing active and Supabase migration scaffolded for later persistence",
    status: "testnet"
  }
];
