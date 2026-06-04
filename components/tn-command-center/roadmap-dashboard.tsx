"use client";

import React, { useState } from "react";
import { motion, Variants } from "framer-motion";
import {
  Cpu,
  Target,
  Link as LinkIcon,
  Bot,
  Activity,
  CheckCircle2,
  CircleDashed,
  Clock,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  LucideIcon
} from "lucide-react";

interface Milestone {
  id: string;
  name: string;
  status: "completed" | "active" | "upcoming";
  metrics: string[];
}

interface Phase {
  id: string;
  name: string;
  status: "completed" | "active" | "upcoming";
  timeframe: string;
  description: string;
  icon: LucideIcon;
  milestones: Milestone[];
}

const phases: Phase[] = [
  {
    id: "phase-0",
    name: "Phase 0: Foundation",
    status: "completed",
    timeframe: "Q1 - Q2 2026",
    description: "Establish AI governance and secure infrastructure.",
    icon: ShieldAlert,
    milestones: [
      { id: "m0-1", name: "Data Lake Refactoring", status: "completed", metrics: ["100% Migration", "0 Downtime"] },
      { id: "m0-2", name: "Cyber-Security Audit", status: "completed", metrics: ["A+ Rating", "0 Vulns"] },
    ],
  },
  {
    id: "phase-1",
    name: "Phase 1: Pilot",
    status: "completed",
    timeframe: "Q3 2026",
    description: "Initial AI models in non-critical systems.",
    icon: Target,
    milestones: [
      { id: "m1-1", name: "Predictive Maintenance Alpha", status: "completed", metrics: ["85% Accuracy"] },
      { id: "m1-2", name: "Document RAG", status: "completed", metrics: ["10k Docs Indexed"] },
    ],
  },
  {
    id: "phase-2",
    name: "Phase 2: Scale",
    status: "active",
    timeframe: "Q4 2026",
    description: "Widespread deployment of core AI agents.",
    icon: Activity,
    milestones: [
      { id: "m2-1", name: "Supply Chain Opt", status: "active", metrics: ["-15% Latency"] },
      { id: "m2-2", name: "Digital Twin Sync", status: "active", metrics: ["Sub-second Sync"] },
    ],
  },
  {
    id: "phase-3",
    name: "Phase 3: Autonomous",
    status: "upcoming",
    timeframe: "Q1 2027",
    description: "Self-healing networks and autonomous agents.",
    icon: Bot,
    milestones: [
      { id: "m3-1", name: "Auto-remediation", status: "upcoming", metrics: ["Target: <1m"] },
      { id: "m3-2", name: "Agent Swarms", status: "upcoming", metrics: ["Target: 100+"] },
    ],
  },
  {
    id: "phase-4",
    name: "Phase 4: Singularity",
    status: "upcoming",
    timeframe: "Q2 2027+",
    description: "Complete systemic integration and continuous evolution.",
    icon: Sparkles,
    milestones: [
      { id: "m4-1", name: "Full System Synthesis", status: "upcoming", metrics: ["Self-Evolving"] },
      { id: "m4-2", name: "Global Operations", status: "upcoming", metrics: ["0 Human Int."] },
    ],
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      mass: 1,
    },
  },
};

const lineVariants: Variants = {
  hidden: { scaleX: 0 },
  show: {
    scaleX: 1,
    transition: {
      duration: 1.5,
      ease: "easeInOut",
    },
  },
};

export function RoadmapDashboard() {
  const [hoveredPhase, setHoveredPhase] = useState<string | null>(null);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden font-sans">
      {/* Decorative top title floating */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, type: "spring" }}
        className="absolute top-8 left-8 z-20"
      >
        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-black/20 backdrop-blur-3xl border border-white/10 shadow-[0_0_30px_rgba(0,180,255,0.1)]">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <h1 className="text-xl font-medium text-white tracking-widest uppercase">
            AI Adoption Roadmap
          </h1>
        </div>
      </motion.div>

      {/* Main Timeline Canvas */}
      {/* The center must remain open per Open Center Layout Directive */}
      <div className="w-full h-full overflow-x-auto overflow-y-hidden custom-scrollbar snap-x snap-mandatory flex items-center px-12 md:px-32 relative z-10">
        
        {/* Continuous Background Line */}
        <div className="absolute top-1/2 left-0 w-[200%] h-[2px] -translate-y-1/2 z-0 hidden md:block">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex items-center gap-12 md:gap-24 relative z-10 w-max pb-12 pt-24"
        >
          {phases.map((phase, index) => {
            const Icon = phase.icon;
            const isHovered = hoveredPhase === phase.id;

            let statusColor = "text-white/40 border-white/10";
            let glow = "";
            let bgGlass = "bg-black/20";
            
            if (phase.status === "completed") {
              statusColor = "text-emerald-400 border-emerald-500/30";
              glow = "shadow-[0_0_30px_rgba(16,185,129,0.1)]";
              bgGlass = "bg-emerald-950/20";
            } else if (phase.status === "active") {
              statusColor = "text-cyan-400 border-cyan-500/50";
              glow = "shadow-[0_0_40px_rgba(6,182,214,0.3)]";
              bgGlass = "bg-cyan-950/30";
            } else {
              statusColor = "text-white/30 border-white/10";
              bgGlass = "bg-black/20";
            }

            return (
              <motion.div
                key={phase.id}
                variants={itemVariants}
                className="relative snap-center shrink-0 flex flex-col items-center group"
                onMouseEnter={() => setHoveredPhase(phase.id)}
                onMouseLeave={() => setHoveredPhase(null)}
              >
                {/* Connecting Line Segment between nodes */}
                {index < phases.length - 1 && (
                  <div className="absolute top-1/2 left-[100%] w-12 md:w-24 h-[2px] -translate-y-1/2 z-0 overflow-hidden">
                    <motion.div
                      variants={lineVariants}
                      className="w-full h-full origin-left bg-gradient-to-r from-white/20 to-white/5"
                    />
                  </div>
                )}

                {/* Node Container */}
                <div
                  className={`
                    w-72 md:w-80 rounded-2xl p-6 transition-all duration-500 backdrop-blur-3xl
                    border border-white/5 ${bgGlass} ${glow}
                    ${isHovered ? 'scale-105 border-white/20 z-20 shadow-2xl' : 'scale-100 z-10'}
                  `}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className={`text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2 ${statusColor.split(' ')[0]}`}>
                        {phase.status === "completed" && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {phase.status === "active" && <CircleDashed className="w-3.5 h-3.5 animate-spin-slow" />}
                        {phase.status === "upcoming" && <Clock className="w-3.5 h-3.5" />}
                        {phase.status}
                      </div>
                      <h3 className="text-xl font-semibold text-white/90 group-hover:text-white transition-colors">
                        {phase.name.split(':')[1]}
                      </h3>
                      <div className="text-xs text-white/40 mt-1 uppercase tracking-widest">{phase.timeframe}</div>
                    </div>
                    <div className={`p-3 rounded-xl border ${statusColor} bg-black/40 backdrop-blur-md`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <p className="text-sm text-white/50 mb-6 group-hover:text-white/70 transition-colors line-clamp-2">
                    {phase.description}
                  </p>

                  {/* Milestones */}
                  <div className="space-y-3">
                    {phase.milestones.map((milestone) => (
                      <div
                        key={milestone.id}
                        className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-lg p-3 flex flex-col gap-2 transition-all hover:bg-white/[0.03]"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white/80">{milestone.name}</span>
                          {milestone.status === "completed" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                          {milestone.status === "active" && <Activity className="w-4 h-4 text-cyan-400" />}
                          {milestone.status === "upcoming" && <Clock className="w-4 h-4 text-white/30" />}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {milestone.metrics.map((metric, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-sm bg-white/5 text-[10px] uppercase tracking-wider text-white/50">
                              {metric}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Connection dot */}
                <div className="absolute top-full mt-4 flex flex-col items-center">
                   <div className="w-[1px] h-8 bg-gradient-to-b from-white/20 to-transparent" />
                   <div className={`w-3 h-3 rounded-full border border-white/20 ${phase.status === 'completed' ? 'bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : phase.status === 'active' ? 'bg-cyan-400 shadow-[0_0_15px_rgba(6,182,214,0.6)]' : 'bg-transparent'}`} />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Edge decoration */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/80 via-black/20 to-transparent pointer-events-none" />
    </div>
  );
}
