import { CourseModuleId } from "./course-store";

export interface CourseStep {
  id: string;
  title: string;
  dialogue: {
    brief: string; // Legacy fallback
    medium: string; // Legacy fallback
    expanded: string; // Source of truth for LLM context
  };
  citations?: { title: string; url: string; source: string }[];
}

export interface CourseData {
  moduleId: CourseModuleId;
  title: string;
  description: string;
  steps: CourseStep[];
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export const COURSE_CATALOG: Record<CourseModuleId, CourseData> = {
  overview: {
    moduleId: "overview",
    title: "Executive Overview",
    description: "Learn how Nakashima-Tsubaki fuses AI with heavy industry.",
    steps: [
      {
        id: "ov_intro",
        title: "Industrial Re-platforming",
        dialogue: { brief: "", medium: "", expanded: "Fact 1: Industrial automation has historically been fragmented across silos like MES, SCADA, and historians. Fact 2: Nakashima-Tsubaki introduces an autonomous cognitive layer on top of these, breaking down data silos without replacing legacy hardware. Fact 3: The goal is deterministic twinning—where AI controls physical hardware securely." },
        citations: [{ title: "Industry 4.0 Overview", url: "https://en.wikipedia.org/wiki/Fourth_Industrial_Revolution", source: "Wikipedia" }]
      }
    ],
    quiz: [{ question: "What is the primary goal of the Nakashima-Tsubaki platform?", options: ["Replacing legacy PLCs", "Deterministic twinning and cognitive orchestration", "Building consumer apps", "Manual data entry"], correctIndex: 1, explanation: "We orchestrate cognitive decisions on top of legacy hardware via digital twins." }]
  },
  roadmap: {
    moduleId: "roadmap",
    title: "AI Adoption Roadmap",
    description: "The phased strategy for autonomous industrial deployment.",
    steps: [
      {
        id: "rm_phase1",
        title: "Shadow Mode to Autonomous",
        dialogue: { brief: "", medium: "", expanded: "Fact 1: Factories cannot flip a switch to full AI autonomy; it requires a phased rollout. Fact 2: Phase 1 is 'Shadow Mode' where the AI observes human operators without taking action. Fact 3: Phase 2 is 'Advisory Mode' (Human-in-the-loop) where the AI suggests actions. Fact 4: Phase 3 is 'Fully Autonomous' (Agentic orchestration)." }
      }
    ],
    quiz: [{ question: "What is 'Shadow Mode'?", options: ["AI controls everything blindly", "AI only operates at night", "AI observes human actions silently to build its neural models", "AI deletes legacy code"], correctIndex: 2, explanation: "Shadow mode safely builds context without risking factory uptime." }]
  },
  rag: {
    moduleId: "rag",
    title: "RAG Knowledge Architecture",
    description: "Retrieval-Augmented Generation for industrial maintenance.",
    steps: [
      {
        id: "rag_vectors",
        title: "Vector Embeddings & pgvector",
        dialogue: { brief: "", medium: "", expanded: "Fact 1: LLMs hallucinate, which is unacceptable when repairing a $5M turbine. Fact 2: We use RAG (Retrieval-Augmented Generation) to ground the LLM in real maintenance manuals. Fact 3: Documents are chunked and converted into 1536-dimensional embeddings. Fact 4: These vectors are stored in Supabase using the pgvector extension for incredibly fast cosine similarity searches." },
        citations: [{ title: "Supabase pgvector Guide", url: "https://supabase.com/docs/guides/database/extensions/pgvector", source: "Supabase Docs" }]
      }
    ],
    quiz: [{ question: "Why do we use RAG instead of just asking a base LLM?", options: ["It's cheaper", "It looks cooler", "To prevent hallucinations by grounding answers in verified technical manuals", "It makes the UI faster"], correctIndex: 2, explanation: "RAG forces the LLM to read from specific, verified text chunks." }]
  },
  twins: {
    moduleId: "twins",
    title: "Digital Twin Command",
    description: "Cyber-physical synchronization in real time.",
    steps: [
      {
        id: "dt_sync",
        title: "The Telemetry Firehose",
        dialogue: { brief: "", medium: "", expanded: "Fact 1: A digital twin is useless if it's not synchronized with reality. Fact 2: We stream 100Hz telemetry (temperature, vibration, pressure) directly from Level 1 PLCs. Fact 3: We utilize WebGL and Three.js on the frontend to visualize this real-time stream mapped onto a 3D CAD model." }
      }
    ],
    quiz: [{ question: "What frequency do we stream telemetry at for the twin?", options: ["1Hz", "10Hz", "100Hz", "1000Hz"], correctIndex: 2, explanation: "100Hz provides sub-second real-time responsiveness." }]
  },
  ledger: {
    moduleId: "ledger",
    title: "Provenance Ledger",
    description: "Cryptographic auditing for AI decisions.",
    steps: [
      {
        id: "led_hcs",
        title: "Hedera Consensus Service",
        dialogue: { brief: "", medium: "", expanded: "Fact 1: When an AI makes a decision that shuts down a factory line, you need cryptographic proof of *why* it made that choice. Fact 2: We use the Hedera Consensus Service (HCS) to anchor state hashes to a public DLT. Fact 3: This provides immutable, decentralized timestamping that holds up in a court of law or insurance audit." },
        citations: [{ title: "Hedera Consensus Service Docs", url: "https://docs.hedera.com/hedera/core-concepts/consensus-service", source: "Hedera" }]
      }
    ],
    quiz: [{ question: "Why do we use Hedera HCS?", options: ["To mint crypto tokens", "To store entire video files", "For immutable, cryptographic timestamping of AI decisions", "To speed up Postgres"], correctIndex: 2, explanation: "HCS gives us a decentralized, tamper-proof audit log." }]
  },
  advisory: {
    moduleId: "advisory",
    title: "Advisory Automation",
    description: "Human-in-the-loop approvals.",
    steps: [
      {
        id: "adv_hitl",
        title: "The HITL Workflow",
        dialogue: { brief: "", medium: "", expanded: "Fact 1: In high-risk environments, full autonomy is restricted by safety compliance. Fact 2: Human-In-The-Loop (HITL) means the AI pauses execution and requests a cryptographic signature from a human operator to proceed. Fact 3: The operator reviews the reasoning trace and signs off via SSO." }
      }
    ],
    quiz: [{ question: "What does HITL stand for?", options: ["Hardware In The Loop", "Human In The Loop", "Heavy Industrial Tooling Logic", "Heuristic Intelligence Testing Layer"], correctIndex: 1, explanation: "Human-In-The-Loop ensures operators maintain final authority." }]
  },
  governance: {
    moduleId: "governance",
    title: "Risk and Governance",
    description: "Safety boundaries and policy enforcement.",
    steps: [
      {
        id: "gov_policy",
        title: "Deterministic Safety Bounds",
        dialogue: { brief: "", medium: "", expanded: "Fact 1: You can't let a generative neural net directly command a robotic arm without a net. Fact 2: We utilize a deterministic Policy Engine that intercepts all AI commands. Fact 3: If an AI suggests a motor speed of 5000 RPM, but the hardware threshold is 4000 RPM, the Policy Engine rejects it unconditionally." }
      }
    ],
    quiz: [{ question: "What stops the AI from commanding unsafe hardware states?", options: ["The LLM system prompt", "A deterministic Policy Engine", "The CEO", "Nothing"], correctIndex: 1, explanation: "LLMs are non-deterministic, so a deterministic Policy Engine is required for hard safety bounds." }]
  },
  architecture: {
    moduleId: "architecture",
    title: "System Architecture & The Purdue Model",
    description: "Learn how modern industrial AI maps to legacy ISA-95/Purdue models without vendor lock-in.",
    steps: [
      {
        id: "arch_intro",
        title: "The Industrial Stack",
        dialogue: { brief: "", medium: "", expanded: "Fact 1: The Purdue Enterprise Reference Architecture (PERA) isolates the factory floor (Level 0-2) from the corporate network (Level 4-5). Fact 2: Nakashima-Tsubaki injects modern cloud components (Supabase, Vercel) at Level 4/5, and connects them down to the PLCs via edge gateways." },
        citations: [{ title: "Purdue Enterprise Reference Architecture", url: "https://en.wikipedia.org/wiki/Purdue_Enterprise_Reference_Architecture", source: "Wikipedia" }]
      }
    ],
    quiz: [{ question: "What does the Purdue Model primarily do?", options: ["Isolates IT from OT for security", "Makes the database faster", "Writes code automatically", "Compresses vector embeddings"], correctIndex: 0, explanation: "It is an architecture model designed to isolate Enterprise IT from Operational Technology (OT)." }]
  },
  kpis: {
    moduleId: "kpis",
    title: "KPI Dashboard",
    description: "Executive signal tracking.",
    steps: [
      {
        id: "kpi_oee",
        title: "OEE and Anomaly Detection",
        dialogue: { brief: "", medium: "", expanded: "Fact 1: Overall Equipment Effectiveness (OEE) is the gold standard for manufacturing productivity. Fact 2: The cognitive swarm uses predictive models to anticipate failures before they occur, effectively raising the OEE score by reducing unplanned downtime." }
      }
    ],
    quiz: [{ question: "What does OEE stand for?", options: ["Operational Error Execution", "Overall Equipment Effectiveness", "Original Energy Efficiency", "Object Embedding Engine"], correctIndex: 1, explanation: "Overall Equipment Effectiveness is the standard metric for manufacturing productivity." }]
  },
  qa: {
    moduleId: "qa",
    title: "QA Evidence Registry",
    description: "Computer vision and anomaly tracking.",
    steps: [
      {
        id: "qa_cv",
        title: "Visual Inspection Models",
        dialogue: { brief: "", medium: "", expanded: "Fact 1: Human QA inspectors suffer from fatigue, leading to missed defects. Fact 2: We use edge-deployed Computer Vision models (like YOLOv8) to draw bounding boxes around micro-fractures in real-time. Fact 3: The confidence scores are recorded to the Provenance Ledger for auditing." }
      }
    ],
    quiz: [{ question: "Why do we record QA confidence scores to the ledger?", options: ["To use up storage space", "For immutable auditing of why a part passed or failed", "To train the LLM faster", "To display cool graphs"], correctIndex: 1, explanation: "Immutable auditing ensures a defective part can be traced back to the exact inference moment." }]
  },
  cognitive: {
    moduleId: "cognitive",
    title: "Cognitive Swarm",
    description: "Multi-agent orchestration.",
    steps: [
      {
        id: "cog_swarm",
        title: "The Agent Swarm",
        dialogue: { brief: "", medium: "", expanded: "Fact 1: A single LLM cannot handle complex factory logistics. Fact 2: We use a Swarm Architecture. The 'Planner' agent breaks down the goal. The 'Researcher' queries RAG. The 'Executor' drafts the control logic. The 'Reviewer' checks for safety. Fact 3: They converse in an internal state loop until consensus is reached." },
        citations: [{ title: "AutoGPT / Agent Swarms", url: "https://github.com/Significant-Gravitas/AutoGPT", source: "GitHub" }]
      }
    ],
    quiz: [{ question: "In a Swarm architecture, what does the 'Reviewer' agent do?", options: ["Searches the web", "Writes the code", "Checks the Executor's logic against safety policies before execution", "Deletes databases"], correctIndex: 2, explanation: "The Reviewer acts as an internal safety barrier before physical execution." }]
  }
};
