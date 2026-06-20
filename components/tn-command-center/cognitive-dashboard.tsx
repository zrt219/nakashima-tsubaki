"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { CommandCenterShell, ShellActionLink } from "./command-center-shell";
import { overviewEvents } from "@/lib/tn-ai-data";
import { AcademicHeader } from "@/components/education/AcademicHeader";
import { LearningTrigger } from "@/components/education/LearningTrigger";

type Node = {
  id: number;
  x: number;
  y: number;
  label: string;
  type: "core" | "evidence" | "thought" | "decision";
};

type Edge = {
  from: number;
  to: number;
};

function generateCognitiveGraph() {
  const nodes: Node[] = [
    { id: 0, x: 50, y: 50, label: "KERNEL", type: "core" },
    { id: 1, x: 30, y: 30, label: "Telemetry Ingestion", type: "thought" },
    { id: 2, x: 70, y: 30, label: "RAG Context Match", type: "thought" },
    { id: 3, x: 20, y: 70, label: "Anomaly Detected", type: "evidence" },
    { id: 4, x: 80, y: 70, label: "Historical Baseline", type: "evidence" },
    { id: 5, x: 50, y: 80, label: "Operator Alert", type: "decision" },
    { id: 6, x: 40, y: 15, label: "Sensor 01A", type: "evidence" },
    { id: 7, x: 60, y: 15, label: "Standard Q-44", type: "evidence" },
  ];

  const edges: Edge[] = [
    { from: 1, to: 0 },
    { from: 2, to: 0 },
    { from: 3, to: 1 },
    { from: 4, to: 2 },
    { from: 0, to: 5 },
    { from: 6, to: 1 },
    { from: 7, to: 2 },
  ];

  return { nodes, edges };
}

export function CognitiveDashboard() {
  const { nodes, edges } = generateCognitiveGraph();
  const [activeNode, setActiveNode] = useState<number | null>(null);

  // Animate node positions to simulate a live force graph
  const [jiggledNodes, setJiggledNodes] = useState(nodes);

  useEffect(() => {
    const interval = setInterval(() => {
      setJiggledNodes((prev) =>
        prev.map((n) => ({
          ...n,
          x: n.x + (Math.random() - 0.5) * 2,
          y: n.y + (Math.random() - 0.5) * 2,
        }))
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const getNodeColor = (type: string) => {
    switch (type) {
      case "core": return "border-cyan-400 bg-cyan-400/20 text-cyan-200 shadow-[0_0_20px_rgba(0,212,255,0.4)]";
      case "thought": return "border-purple-400 bg-purple-400/10 text-purple-300";
      case "evidence": return "border-emerald-400 bg-emerald-400/10 text-emerald-300";
      case "decision": return "border-amber-400 bg-amber-400/20 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]";
      default: return "border-white/50 bg-white/10 text-white";
    }
  };

  return (
    <CommandCenterShell
      activeAreaId="cognitive"
      eventStream={overviewEvents}
      utilityActions={<ShellActionLink href="/simulator" label="Return to Simulator" tone="secondary" />}
    >
      <div className="flex h-full flex-col p-4 xl:p-6 gap-4">
        <AcademicHeader topic="llm_diagnostics" />
        <LearningTrigger topic="llm_diagnostics">
        <div className="relative h-[calc(100vh-170px)] w-full overflow-hidden rounded-lg border border-purple-500/20 bg-black/10">
          
          {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

        <div className="absolute top-4 left-4 z-10 p-4 border border-purple-500/30 bg-black/60 backdrop-blur-md">
          <h2 className="text-xs font-bold uppercase tracking-widest text-purple-400">Agent Swarm Cognition Matrix</h2>
          <p className="text-[10px] text-command-muted mt-1 max-w-[250px]">Live visualization of multi-agent thought vectors and decision pathways.</p>
        </div>

        {/* SVG Edges */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {edges.map((e, i) => {
            const from = jiggledNodes.find((n) => n.id === e.from);
            const to = jiggledNodes.find((n) => n.id === e.to);
            if (!from || !to) return null;
            return (
              <motion.line
                key={i}
                x1={`${from.x}%`}
                y1={`${from.y}%`}
                x2={`${to.x}%`}
                y2={`${to.y}%`}
                stroke="rgba(168,85,247,0.4)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {jiggledNodes.map((n) => {
          const isActive = activeNode === n.id;
          return (
            <motion.div
              key={n.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
              animate={{ left: `${n.x}%`, top: `${n.y}%` }}
              transition={{ type: "spring", stiffness: 50, damping: 20 }}
              onMouseEnter={() => setActiveNode(n.id)}
              onMouseLeave={() => setActiveNode(null)}
            >
              {isActive && (
                <div className="absolute inset-0 rounded-full border border-purple-400 animate-ping opacity-50 pointer-events-none" />
              )}
              <div className={`px-3 py-1.5 rounded-full border text-[10px] font-mono whitespace-nowrap cursor-pointer transition-all ${getNodeColor(n.type)} ${isActive ? 'scale-110 z-20' : 'scale-100 z-10'}`}>
                {n.label}
              </div>
            </motion.div>
          );
        })}

        </div>
        </LearningTrigger>
      </div>
    </CommandCenterShell>
  );
}
