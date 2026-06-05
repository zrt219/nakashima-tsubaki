"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Activity, 
  BrainCircuit, 
  Dna, 
  Radio, 
  Waves, 
  Zap,
  Hexagon,
  Network,
  Share2,
  Workflow
} from "lucide-react";

export default function AgentFamilyDashboard() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden text-white font-mono bg-transparent">
      {/* 
        CRITICAL: Open Center Layout Directive
        The center is completely transparent to allow the 3D WebGL background to be visible.
        Panels are strictly bound to the left, right, and bottom edges.
      */}
      
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none p-6">
        
        {/* Top/Middle Section with Left/Right Rails */}
        <div className="flex justify-between items-start flex-1 w-full">
          
          {/* LEFT RAIL: Dolphin Pod Console */}
          <motion.div 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 60, damping: 20 }}
            className="pointer-events-auto w-96 flex flex-col gap-4 bg-black/20 backdrop-blur-3xl border border-blue-500/30 rounded-2xl p-5 h-full max-h-[75vh] overflow-y-auto"
          >
            <div className="flex items-center gap-3 border-b border-blue-500/30 pb-3 mb-2">
              <Waves className="text-blue-400" size={24} />
              <h2 className="text-xl font-bold tracking-widest text-blue-100 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]">DOLPHIN POD CONSOLE</h2>
            </div>
            
            <div className="space-y-4">
              <PanelSection title="Active Pods" color="blue">
                <div className="flex justify-between items-center bg-blue-900/20 p-2 rounded border border-blue-800/50 hover:bg-blue-900/40 transition-colors">
                  <span className="text-blue-200">Pod Alpha</span>
                  <Activity size={16} className="text-blue-400" />
                </div>
                <div className="flex justify-between items-center bg-blue-900/20 p-2 rounded border border-blue-800/50 hover:bg-blue-900/40 transition-colors">
                  <span className="text-blue-200">Pod Beta</span>
                  <Activity size={16} className="text-blue-400" />
                </div>
              </PanelSection>

              <PanelSection title="Orchestrators" color="blue">
                <div className="space-y-3">
                  <ProgressBar label="Sync Level" value={94} color="bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                  <ProgressBar label="Task Distribution" value={88} color="bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                </div>
              </PanelSection>

              <PanelSection title="Echo Mappers" color="blue">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-black/40 border border-blue-500/20 p-3 rounded flex flex-col items-center hover:border-cyan-500/50 transition-colors">
                    <Radio size={18} className="text-cyan-400 mb-2" />
                    <span className="text-cyan-200/70 mb-1">Sonar Ping</span>
                    <span className="font-bold text-cyan-100 text-sm">12ms</span>
                  </div>
                  <div className="bg-black/40 border border-blue-500/20 p-3 rounded flex flex-col items-center hover:border-cyan-500/50 transition-colors">
                    <Share2 size={18} className="text-cyan-400 mb-2" />
                    <span className="text-cyan-200/70 mb-1">Topology</span>
                    <span className="font-bold text-cyan-100 text-sm">Mapped</span>
                  </div>
                </div>
              </PanelSection>

              <PanelSection title="Consensus Signals" color="blue">
                <div className="flex items-center gap-4 bg-blue-950/40 p-4 rounded-lg border border-blue-500/30">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <BrainCircuit className="text-indigo-400" size={28} />
                  </motion.div>
                  <div className="text-sm">
                    <div className="text-indigo-200 font-semibold text-base mb-1">Global Harmony: 99.2%</div>
                    <div className="text-indigo-400/70 text-xs">Awaiting final validation...</div>
                  </div>
                </div>
              </PanelSection>
            </div>
          </motion.div>

          {/* RIGHT RAIL: Bee Hive Console */}
          <motion.div 
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 60, damping: 20 }}
            className="pointer-events-auto w-96 flex flex-col gap-4 bg-black/20 backdrop-blur-3xl border border-amber-500/30 rounded-2xl p-5 h-full max-h-[75vh] overflow-y-auto"
          >
            <div className="flex items-center gap-3 border-b border-amber-500/30 pb-3 mb-2">
              <Hexagon className="text-amber-400" size={24} />
              <h2 className="text-xl font-bold tracking-widest text-amber-100 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]">BEE HIVE CONSOLE</h2>
            </div>
            
            <div className="space-y-4">
              <PanelSection title="Worker Swarm Status" color="amber">
                <div className="flex items-center justify-between text-sm mb-3 bg-amber-900/20 p-2 rounded">
                  <span className="text-amber-200/70 uppercase tracking-wide">Total Drones</span>
                  <span className="text-amber-400 font-bold text-lg drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]">1,024</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-amber-950/40 border border-amber-700/50 p-2 rounded hover:bg-amber-900/40 transition-colors">
                    <div className="text-amber-500 mb-1 font-semibold uppercase">Forager</div>
                    <div className="text-amber-100 text-lg">450</div>
                  </div>
                  <div className="bg-amber-950/40 border border-amber-700/50 p-2 rounded hover:bg-amber-900/40 transition-colors">
                    <div className="text-amber-500 mb-1 font-semibold uppercase">Nurse</div>
                    <div className="text-amber-100 text-lg">320</div>
                  </div>
                  <div className="bg-amber-950/40 border border-amber-700/50 p-2 rounded hover:bg-amber-900/40 transition-colors">
                    <div className="text-amber-500 mb-1 font-semibold uppercase">Builder</div>
                    <div className="text-amber-100 text-lg">254</div>
                  </div>
                </div>
              </PanelSection>

              <PanelSection title="Waggle Routing Tasks" color="amber">
                <div className="space-y-3">
                  <div className="bg-black/40 p-3 border-l-2 border-amber-500 rounded text-sm hover:bg-amber-900/20 transition-colors">
                    <div className="text-amber-300 font-semibold flex justify-between mb-1">
                      <span>Nectar Gather (Data)</span>
                      <span className="text-amber-400">78%</span>
                    </div>
                    <div className="text-amber-200/50 text-xs">Vector DB Ingestion Pipeline</div>
                    <div className="mt-2 h-1 bg-black rounded-full overflow-hidden">
                      <motion.div className="h-full bg-amber-500" initial={{ width: 0 }} animate={{ width: "78%" }} transition={{ duration: 1 }} />
                    </div>
                  </div>
                  <div className="bg-black/40 p-3 border-l-2 border-orange-500 rounded text-sm hover:bg-orange-900/20 transition-colors">
                    <div className="text-orange-300 font-semibold flex justify-between mb-1">
                      <span>Comb Build (UI)</span>
                      <span className="text-orange-400">42%</span>
                    </div>
                    <div className="text-amber-200/50 text-xs">Component Rendering Tree</div>
                    <div className="mt-2 h-1 bg-black rounded-full overflow-hidden">
                      <motion.div className="h-full bg-orange-500" initial={{ width: 0 }} animate={{ width: "42%" }} transition={{ duration: 1 }} />
                    </div>
                  </div>
                </div>
              </PanelSection>
              
              <PanelSection title="Hive Metrics" color="amber">
                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col items-center justify-center p-3 bg-amber-900/20 rounded-lg border border-amber-500/20">
                    <Network className="text-amber-400 mb-2" size={20} />
                    <span className="text-2xl font-bold text-amber-100">12k</span>
                    <span className="text-[10px] text-amber-500 uppercase tracking-wider mt-1">Msg/sec</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center p-3 bg-orange-900/20 rounded-lg border border-orange-500/20">
                    <Workflow className="text-orange-400 mb-2" size={20} />
                    <span className="text-2xl font-bold text-orange-100">99.9%</span>
                    <span className="text-[10px] text-orange-500 uppercase tracking-wider mt-1">Uptime</span>
                  </div>
                </div>
              </PanelSection>
            </div>
          </motion.div>
        </div>

        {/* BOTTOM RAIL: Agent Genome Lab & Nursery */}
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 60, damping: 20, delay: 0.2 }}
          className="pointer-events-auto mt-6 w-full bg-black/20 backdrop-blur-3xl border border-emerald-500/30 rounded-2xl p-5"
        >
          <div className="flex items-center gap-3 border-b border-emerald-500/30 pb-3 mb-4">
            <Dna className="text-emerald-400" size={24} />
            <h2 className="text-xl font-bold tracking-widest text-emerald-100 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]">AGENT GENOME LAB & NURSERY</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <h3 className="text-sm uppercase tracking-widest text-emerald-500 font-semibold mb-3 flex items-center gap-2">
                <Zap size={14} className="text-emerald-400" /> Genome Versions
              </h3>
              <div className="bg-emerald-950/30 p-3 rounded border border-emerald-800/40 text-sm space-y-2">
                <div className="flex justify-between items-center p-1.5 hover:bg-emerald-900/30 rounded transition-colors">
                  <span className="text-emerald-300 font-medium">v9.0.4-alpha</span>
                  <span className="text-emerald-500 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 text-xs shadow-[0_0_5px_rgba(16,185,129,0.5)]">Active</span>
                </div>
                <div className="flex justify-between items-center p-1.5 hover:bg-emerald-900/30 rounded transition-colors">
                  <span className="text-emerald-200/50">v9.0.3-stable</span>
                  <span className="text-emerald-500/50 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/50 text-xs">Backup</span>
                </div>
                <div className="flex justify-between items-center p-1.5 hover:bg-emerald-900/30 rounded transition-colors">
                  <span className="text-emerald-200/50">v9.1.0-beta</span>
                  <span className="text-emerald-400 bg-emerald-900 px-2 py-0.5 rounded border border-emerald-700 text-xs animate-pulse">Incubating</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm uppercase tracking-widest text-emerald-500 font-semibold mb-3">
                Mutation Hypotheses
              </h3>
              <div className="space-y-3">
                <div className="bg-black/40 border border-emerald-900/50 p-3 rounded text-sm flex items-center justify-between hover:border-emerald-500/50 transition-colors">
                  <span className="text-emerald-200">Context Window +20%</span>
                  <span className="text-emerald-400 font-mono text-xs bg-emerald-950 px-2 py-1 rounded">Testing</span>
                </div>
                <div className="bg-black/40 border border-emerald-900/50 p-3 rounded text-sm flex items-center justify-between hover:border-emerald-500/50 transition-colors">
                  <span className="text-emerald-200">Attention Span Decay Fix</span>
                  <span className="text-emerald-500 font-mono text-xs bg-emerald-950 px-2 py-1 rounded">Verified</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm uppercase tracking-widest text-emerald-500 font-semibold mb-3">
                Fitness Scores
              </h3>
              <div className="space-y-4">
                <ProgressBar label="Reasoning Accuracy" value={96} color="bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" textClass="text-emerald-200" />
                <ProgressBar label="Creativity Index" value={84} color="bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)]" textClass="text-teal-200" />
                <ProgressBar label="Latency Tolerance" value={99} color="bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]" textClass="text-green-200" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function PanelSection({ title, children, color }: { title: string, children: React.ReactNode, color: 'blue' | 'amber' | 'emerald' }) {
  const colorMap = {
    blue: "text-blue-400 border-blue-900/50",
    amber: "text-amber-400 border-amber-900/50",
    emerald: "text-emerald-400 border-emerald-900/50"
  };
  
  return (
    <div className="mb-5">
      <h3 className={`text-[11px] uppercase tracking-[0.2em] font-semibold mb-3 ${colorMap[color].split(' ')[0]}`}>
        {title}
      </h3>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

function ProgressBar({ label, value, color, textClass = "text-gray-300" }: { label: string, value: number, color: string, textClass?: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className={textClass}>{label}</span>
        <span className="font-bold font-mono">{value}%</span>
      </div>
      <div className="h-2 bg-black/60 rounded-full overflow-hidden border border-white/5">
        <motion.div 
          className={`h-full ${color}`} 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.5, type: "spring", bounce: 0.2 }}
        />
      </div>
    </div>
  );
}
