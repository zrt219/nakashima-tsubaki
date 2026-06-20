"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useLearning } from "./LearningContext";
import { Icon } from "@/components/tn-command-center/command-center-primitives";

const ACADEMIC_TOPICS: Record<string, { title: string; concepts: string; methods: string; citations: string[] }> = {
  digital_twin: {
    title: "Cyberphysical Digital Twins",
    concepts: "Digital Twins act as high-fidelity virtual representations that simulate, monitor, and optimize physical assets in real-time. This bridges the cyber and physical domains, enabling smart manufacturing, predictive maintenance, and real-time operational awareness.",
    methods: "Systems are driven by IoT sensor synchronization and continuous data ingestion to update virtual models. The models use predictive analytics and intelligent threat simulation to ensure physical goods replication is accurate.",
    citations: [
      "Lo, C. (2024). Digital Twins of Cyber Physical Systems in Smart Manufacturing. IEEE Xplore.",
      "Abinaya, P. (2024). Smart Manufacturing with a Digital Twin-Driven Cyber-Physical System. IEEE Xplore."
    ]
  },
  double_edge: {
    title: "Double-Edge Automations & Edge Computing",
    concepts: "Processing industrial data closer to where it's generated reduces latency. 'Double-edge' automations introduce a multi-layered infrastructure (e.g., terrestrial MEC + UAVs/LEO satellites) to distribute massive IIoT workloads dynamically without relying solely on the centralized cloud.",
    methods: "Implementation of double-edge-assisted Multi-access Edge Computing (MEC) systems that handle dynamic computation offloading and resource allocation algorithms.",
    citations: [
      "Wang, Z. (2025). Double-Edge-Assisted Computation Offloading and Resource Allocation. arXiv.",
      "Lin, Y. (2024). Satellite-MEC Integration for 6G Internet of Things. IEEE Xplore."
    ]
  },
  recursive_memory: {
    title: "Recursive & Sentient Memory in Autonomous Agents",
    concepts: "Enabling autonomous AI agents to retain, recall, and continually refine context over extended durations. Recursive memory loops allow agents to consolidate specific episodic instances into generalized semantic knowledge, crucial for executing long-horizon tasks autonomously without losing context.",
    methods: "Utilizing advanced context engineering beyond standard attention mechanisms, including recursive memory consolidation pipelines and non-attention LLMs that loop previous state contexts back into decision-making nodes.",
    citations: [
      "Anon. (2026). A Platform for Evaluating Long-Horizon Multi-Agent Systems. arXiv:2606.08367v1.",
      "Anon. (2025). A Survey of Context Engineering for Large Language Models. arXiv:2507.13334v1."
    ]
  },
  immutable_ledger: {
    title: "Blockchain/DLT for Industrial Auditability",
    concepts: "Utilizing decentralized ledger technologies (like XRPL or Hedera) strictly to securely log industrial events, provenance data, and system state snapshots. Because DLT cannot support the ultra-low latency required for real-time control, its role is scoped purely as an immutable, transparent ledger for historical auditing.",
    methods: "Implementing blockchain-based log auditing paradigms where industrial edge gateways intermittently anchor hashed state proofs to a DLT. This guarantees tamper-proof historical records for large-scale systemic auditing.",
    citations: [
      "Anon. (2026). Auditing Blockchain Innovations: Technical Challenges. arXiv:2603.26361v1.",
      "Anon. (2025). A blockchain-based log auditing approach for large-scale systems. arXiv:2505.17236."
    ]
  }
};

export function AcademicOverlay() {
  const { isLearningMode, activeTopic, setActiveTopic } = useLearning();

  if (!isLearningMode || !activeTopic || !ACADEMIC_TOPICS[activeTopic]) return null;

  const topic = ACADEMIC_TOPICS[activeTopic];

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="fixed right-6 top-24 z-50 w-96 border border-fuchsia-500/50 bg-black/90 p-6 shadow-[0_0_40px_rgba(217,70,239,0.15)] backdrop-blur-xl"
      >
        <div className="flex items-center justify-between mb-4 border-b border-fuchsia-500/30 pb-2">
          <div className="flex items-center gap-2">
            <Icon name="book" className="h-4 w-4 text-fuchsia-400" />
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-fuchsia-400">Academic Context</h2>
          </div>
          <button onClick={() => setActiveTopic(null)} className="text-fuchsia-400 hover:text-white">
            <Icon name="close" className="h-4 w-4" />
          </button>
        </div>

        <h3 className="mb-3 text-lg font-bold text-white">{topic.title}</h3>
        
        <div className="space-y-4 text-sm text-slate-300">
          <div>
            <h4 className="text-[10px] uppercase text-slate-500 mb-1">Key Concepts</h4>
            <p className="leading-relaxed">{topic.concepts}</p>
          </div>
          
          <div>
            <h4 className="text-[10px] uppercase text-slate-500 mb-1">Methodologies</h4>
            <p className="leading-relaxed">{topic.methods}</p>
          </div>
          
          <div className="mt-4 border-t border-fuchsia-500/20 pt-3">
            <h4 className="text-[10px] uppercase text-fuchsia-300/60 mb-2">Primary Citations</h4>
            <ul className="space-y-2">
              {topic.citations.map((cite, i) => (
                <li key={i} className="text-[11px] leading-tight text-fuchsia-200/80 pl-2 border-l border-fuchsia-500/30">
                  {cite}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export function LearningTrigger({ topic, children, className = "" }: { topic: string; children: React.ReactNode; className?: string }) {
  const { isLearningMode, setActiveTopic, activeTopic } = useLearning();
  
  if (!isLearningMode) return <>{children}</>;

  const isActive = activeTopic === topic;

  return (
    <div 
      className={`relative cursor-pointer transition-all duration-300 ${isActive ? 'ring-2 ring-fuchsia-500 ring-offset-2 ring-offset-black' : 'hover:ring-1 hover:ring-fuchsia-500/50'} ${className}`}
      onClick={() => setActiveTopic(topic)}
    >
      {/* Educational pulsing beacon */}
      <div className="absolute -top-1 -right-1 z-30 flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-fuchsia-500 items-center justify-center">
            <Icon name="search" className="h-2 w-2 text-white" />
        </span>
      </div>
      {children}
    </div>
  );
}
