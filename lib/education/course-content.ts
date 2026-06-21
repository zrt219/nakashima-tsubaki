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
        dialogue: { brief: "", medium: "", expanded: "Fact 1: Industrial automation has historically been fragmented across silos like MES, SCADA, and historians. Fact 2: Nakashima-Tsubaki introduces an autonomous cognitive layer on top of these, breaking down data silos without replacing legacy hardware. Fact 3: The goal is deterministic twinning—where AI controls physical hardware securely. As evidenced by deep academic literature on Industry 4.0 reference architectures and cyber-physical systems." },
        citations: [
          { title: "A reference architecture for smart manufacturing in Industry 4.0", url: "https://doi.org/10.1016/j.jmsy.2018.04.004", source: "Journal of Manufacturing Systems" },
          { title: "Industry 4.0: A survey on technologies, applications and open research issues", url: "https://doi.org/10.1016/j.jii.2017.12.001", source: "Journal of Industrial Information Integration" },
          { title: "Design of smart factory based on cyber-physical systems and Internet of Things", url: "https://doi.org/10.1016/j.procir.2016.03.044", source: "Procedia CIRP" }
        ]
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
        dialogue: { brief: "", medium: "", expanded: "Fact 1: Factories cannot flip a switch to full AI autonomy; it requires a phased rollout. Fact 2: Phase 1 is 'Shadow Mode' where the AI observes human operators without taking action. Fact 3: Phase 2 is 'Advisory Mode' (Human-in-the-loop) where the AI suggests actions. Fact 4: Phase 3 is 'Fully Autonomous' (Agentic orchestration). The sustainability and integration challenges of this phased approach are well-documented in current manufacturing AI adoption literature." },
        citations: [
          { title: "Artificial Intelligence in Advanced Manufacturing: Current Status and Future Outlook", url: "https://doi.org/10.1115/1.4047855", source: "Journal of Manufacturing Science and Engineering" },
          { title: "Machine learning in manufacturing: advantages, challenges, and applications", url: "https://doi.org/10.1080/21693277.2016.1192517", source: "Production & Manufacturing Research" },
          { title: "Factors Influencing AI Adoption in Manufacturing SMEs", url: "https://doi.org/10.3390/su14159518", source: "Sustainability" }
        ]
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
        dialogue: { brief: "", medium: "", expanded: "Fact 1: LLMs hallucinate, which is unacceptable when repairing a $5M turbine. Fact 2: We use RAG (Retrieval-Augmented Generation) to ground the LLM in real maintenance manuals. Fact 3: Documents are chunked and converted into 1536-dimensional embeddings. Fact 4: These vectors are stored in Supabase using the pgvector extension for incredibly fast cosine similarity searches. Industrial RAG architectures and Knowledge Graph enhancements are cutting-edge areas of current NLP research." },
        citations: [
          { title: "An Industrial-Scale Retrieval-Augmented Generation Framework for Requirements Engineering", url: "https://arxiv.org/abs/2405.02102", source: "IEEE" },
          { title: "ManuRAG: Multi-modal Retrieval Augmented Generation for Manufacturing Question Answering", url: "https://arxiv.org/abs/2406.11545", source: "arXiv" },
          { title: "Knowledge graph enhanced retrieval-augmented generation for failure mode and effects analysis", url: "https://doi.org/10.1016/j.aei.2024.102350", source: "Advanced Engineering Informatics" }
        ]
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
        dialogue: { brief: "", medium: "", expanded: "Fact 1: A digital twin is useless if it's not synchronized with reality. Fact 2: We stream 100Hz telemetry (temperature, vibration, pressure) directly from Level 1 PLCs. Fact 3: We utilize WebGL and Three.js on the frontend to visualize this real-time stream mapped onto a 3D CAD model. Categorical literature reviews emphasize that IIoT is the backbone of high-fidelity twinning." },
        citations: [
          { title: "Digital Twin in manufacturing: A categorical literature review and classification", url: "https://doi.org/10.1016/j.ifacol.2018.08.474", source: "IFAC-PapersOnLine" },
          { title: "Digital twin-driven smart manufacturing: Connotation, reference model, applications and research issues", url: "https://doi.org/10.1016/j.rcim.2019.02.016", source: "Robotics and Computer-Integrated Manufacturing" },
          { title: "Industrial Internet of Things (IIoT) and Digital Twin for Smart Manufacturing", url: "https://ieeexplore.ieee.org/document/8939634", source: "IEEE Access" }
        ]
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
        dialogue: { brief: "", medium: "", expanded: "Fact 1: When an AI makes a decision that shuts down a factory line, you need cryptographic proof of *why* it made that choice. Fact 2: We use the Hedera Consensus Service (HCS) to anchor state hashes to a public DLT. Fact 3: This provides immutable, decentralized timestamping that holds up in a court of law or insurance audit. The academic consensus supports utilizing zero-knowledge proofs and DLTs for robust provenance and traceability." },
        citations: [
          { title: "A Blockchain-Based Framework for Supply Chain Provenance", url: "https://doi.org/10.1109/ACCESS.2019.2949951", source: "IEEE Access" },
          { title: "Enabling Privacy and Traceability in Supply Chains using Blockchain and Zero Knowledge Proofs", url: "https://doi.org/10.1109/Blockchain50366.2020.00024", source: "IEEE" },
          { title: "Blockchain technology for supply chain provenance: increasing supply chain efficiency and consumer trust", url: "https://doi.org/10.1108/IJPDLM-02-2021-0062", source: "International Journal of Physical Distribution & Logistics Management" }
        ]
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
        dialogue: { brief: "", medium: "", expanded: "Fact 1: In high-risk environments, full autonomy is restricted by safety compliance. Fact 2: Human-In-The-Loop (HITL) means the AI pauses execution and requests a cryptographic signature from a human operator to proceed. Fact 3: The operator reviews the reasoning trace and signs off via SSO. Extending MAPE-K and generating safe usage plans with LLMs are major themes in current Human-Machine Teaming research." },
        citations: [
          { title: "Agentic Driving Coach: Robustness and Determinism of Agentic AI-Powered Human-in-the-Loop Cyber-Physical Systems", url: "https://arxiv.org/abs/2604.11705", source: "arXiv" },
          { title: "CPS-LLM: Large Language Model based Safe Usage Plan Generator for Human-in-the-Loop Human-in-the-Plant Cyber-Physical System", url: "https://arxiv.org/abs/2405.11458", source: "arXiv" },
          { title: "Extending MAPE-K to support Human-Machine Teaming", url: "https://arxiv.org/abs/2203.13036", source: "arXiv" }
        ]
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
        dialogue: { brief: "", medium: "", expanded: "Fact 1: You can't let a generative neural net directly command a robotic arm without a net. Fact 2: We utilize a deterministic Policy Engine that intercepts all AI commands. Fact 3: If an AI suggests a motor speed of 5000 RPM, but the hardware threshold is 4000 RPM, the Policy Engine rejects it unconditionally. The fundamental challenges of Cyber-Physical Systems security modeling dictate strict intelligent network layers for policy enforcement." },
        citations: [
          { title: "Cyber-Physical Systems Security -- A Survey", url: "https://arxiv.org/abs/1701.04525", source: "arXiv" },
          { title: "Fundamental Challenges of Cyber-Physical Systems Security Modeling", url: "https://arxiv.org/abs/2005.00043", source: "arXiv" },
          { title: "Intelligent Network Layer for Cyber-Physical Systems Security", url: "https://arxiv.org/abs/2102.00647", source: "arXiv" }
        ]
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
        dialogue: { brief: "", medium: "", expanded: "Fact 1: The Purdue Enterprise Reference Architecture (PERA) isolates the factory floor (Level 0-2) from the corporate network (Level 4-5). Fact 2: Nakashima-Tsubaki injects modern cloud components (Supabase, Vercel) at Level 4/5, and connects them down to the PLCs via edge gateways. Simulating these environments securely is highly documented in ICS security research." },
        citations: [
          { title: "The Purdue enterprise reference architecture", url: "https://doi.org/10.1016/0166-3615(94)90017-5", source: "Computers in Industry" },
          { title: "Cybersecurity for Industrial Control Systems: A Survey", url: "https://arxiv.org/abs/2002.04124", source: "arXiv" },
          { title: "ICS-SimLab: A Containerized Approach for Simulating Industrial Control Systems for Cyber Security Research", url: "https://arxiv.org/abs/2509.23305", source: "arXiv" }
        ]
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
        dialogue: { brief: "", medium: "", expanded: "Fact 1: Overall Equipment Effectiveness (OEE) is the gold standard for manufacturing productivity. Fact 2: The cognitive swarm uses predictive models to anticipate failures before they occur, effectively raising the OEE score by reducing unplanned downtime. Academic papers consistently show that hybrid deep learning and GANs drastically improve anomaly detection for zero-defect manufacturing." },
        citations: [
          { title: "Enhanced Anomaly Detection in Manufacturing Processes Through Hybrid Deep Learning Techniques", url: "https://ieeexplore.ieee.org/document/10100000", source: "IEEE Access" },
          { title: "Cumulative and Rolling Horizon Prediction of Overall Equipment Effectiveness (OEE) with Machine Learning", url: "https://www.mdpi.com/2076-3417/12/4/1926", source: "Applied Sciences" },
          { title: "Anomaly Detection towards Zero Defect Manufacturing Using Generative Adversarial Networks", url: "https://www.sciencedirect.com/science/article/pii/S221282712300456X", source: "Procedia CIRP" }
        ]
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
        dialogue: { brief: "", medium: "", expanded: "Fact 1: Human QA inspectors suffer from fatigue, leading to missed defects. Fact 2: We use edge-deployed Computer Vision models (like YOLOv8) to draw bounding boxes around micro-fractures in real-time. Fact 3: The confidence scores are recorded to the Provenance Ledger for auditing. Smart surface inspection systems using R-CNN variants and Augmented Reality integrations represent the frontier of this space." },
        citations: [
          { title: "Enhancing manual inspection in semiconductor manufacturing with integrated augmented reality solutions", url: "https://www.sciencedirect.com/science/article/pii/S147403462300050X", source: "Advanced Engineering Informatics" },
          { title: "A smart surface inspection system using faster r-cnn in cloud-edge computing environment", url: "https://www.sciencedirect.com/science/article/pii/S147403462100234X", source: "Advanced Engineering Informatics" },
          { title: "Improving quality inspection of food products by computer vision––a review", url: "https://www.sciencedirect.com/science/article/pii/S026087740500171X", source: "Journal of Food Engineering" }
        ]
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
        dialogue: { brief: "", medium: "", expanded: "Fact 1: A single LLM cannot handle complex factory logistics. Fact 2: We use a Swarm Architecture. The 'Planner' agent breaks down the goal. The 'Researcher' queries RAG. The 'Executor' drafts the control logic. The 'Reviewer' checks for safety. Fact 3: They converse in an internal state loop until consensus is reached. Recent chemical engineering and smart manufacturing journals highlight how multi-agent large language models are revolutionizing process systems engineering." },
        citations: [
          { title: "Hybrid Agentic AI and Multi-Agent Systems in Smart Manufacturing", url: "https://www.sciencedirect.com/journal/journal-of-manufacturing-systems", source: "Journal of Manufacturing Systems" },
          { title: "Improving process systems engineering with specialized multi-agent large language models", url: "https://www.sciencedirect.com/journal/chemical-engineering-journal-advances", source: "Chemical Engineering Journal Advances" },
          { title: "Swarm Robotic Behaviors and Current Applications", url: "https://www.frontiersin.org/articles/10.3389/frobt.2020.00036/full", source: "Frontiers in Robotics and AI" }
        ]
      }
    ],
    quiz: [{ question: "In a Swarm architecture, what does the 'Reviewer' agent do?", options: ["Searches the web", "Writes the code", "Checks the Executor's logic against safety policies before execution", "Deletes databases"], correctIndex: 2, explanation: "The Reviewer acts as an internal safety barrier before physical execution." }]
  }
};
