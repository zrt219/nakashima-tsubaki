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
    id: "overview",
    index: "01",
    title: "Executive Overview",
    descriptor: "Early adoption operating layer",
    icon: "mission",
    href: "/",
    status: "ready"
  },
  {
    id: "roadmap",
    index: "02",
    title: "AI Adoption Roadmap",
    descriptor: "Standards-first rollout",
    icon: "roadmap",
    href: "/",
    status: "review"
  },
  {
    id: "rag",
    index: "03",
    title: "RAG Knowledge Console",
    descriptor: "Approved corpus retrieval",
    icon: "rag",
    href: "/simulator",
    status: "simulated"
  },
  {
    id: "twins",
    index: "04",
    title: "Digital Twin Command",
    descriptor: "Cyber-physical replay",
    icon: "twin",
    href: "/simulator",
    status: "simulated"
  },
  {
    id: "ledger",
    index: "05",
    title: "Provenance Ledger",
    descriptor: "Evidence hash registry",
    icon: "hash",
    href: "/simulator",
    status: "testnet"
  },
  {
    id: "automation",
    index: "06",
    title: "Advisory Automation",
    descriptor: "Operator-approved workflow",
    icon: "flow",
    href: "/simulator",
    status: "approval"
  },
  {
    id: "governance",
    index: "07",
    title: "Risk and Governance",
    descriptor: "Safety, compliance, audit",
    icon: "shield",
    href: "/",
    status: "locked"
  },
  {
    id: "architecture",
    index: "08",
    title: "Vendor Architecture",
    descriptor: "Open stack comparison",
    icon: "stack",
    href: "/",
    status: "review"
  },
  {
    id: "kpis",
    index: "09",
    title: "KPI Dashboard",
    descriptor: "Executive signal board",
    icon: "chart",
    href: "/",
    status: "simulated"
  },
  {
    id: "qa",
    index: "10",
    title: "QA Evidence Report",
    descriptor: "Verification packet",
    icon: "evidence",
    href: "/simulator",
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
