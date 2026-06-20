"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Icon, StatusChip } from "@/components/tn-command-center/command-center-primitives";
import { overviewEvents } from "@/lib/tn-ai-data";

export function ExecutiveDashboard() {
  return (
    <div className="flex h-full flex-col gap-4">
      {/* Top Header Metrics (Floating overlay style) */}
      <motion.div 
        variants={{ hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } } }}
        initial="hidden" animate="visible"
        className="grid grid-cols-4 gap-4 z-10"
      >
        {[
          { label: "Spindle Speed", value: "12,450", unit: "RPM", trend: "+0.45% vs target", color: "text-white" },
          { label: "Feed Rate", value: "1,250", unit: "mm/min", trend: "+0.10% vs target", color: "text-white" },
          { label: "Coolant Temp", value: "20.6", unit: "°C", trend: "+0.2 °C vs target", color: "text-white" },
          { label: "Power Draw", value: "7.8", unit: "kW", trend: "-1.3% vs baseline", color: "text-white" }
        ].map((metric, i) => (
          <motion.div 
            key={i}
            variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1, transition: { type: "spring", bounce: 0.5 } } }}
            className="relative overflow-hidden border border-command-line/40 bg-black/10 p-4 backdrop-blur-md"
          >
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-command-muted">{metric.label}</p>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className={`text-2xl font-bold ${metric.color}`}>{metric.value}</span>
              <span className="text-[10px] font-semibold uppercase text-cyan-400/60">{metric.unit}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Grid: Transparent Center, Right Rail */}
      <motion.div 
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } } }}
        initial="hidden" animate="visible"
        className="grid flex-1 grid-cols-[1fr_360px] gap-4 relative"
      >
        {/* Center Canvas: OPEN FOR WEBGL */}
        <div className="relative flex flex-col justify-end pb-4">
          {/* Floating UI tags over the 3D twin */}
          <motion.div 
            animate={{ y: [0, -5, 0] }} 
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-[20%] z-10 hidden xl:block"
          >
            <div className="flex items-center gap-2">
              <div className="h-[1px] w-12 bg-cyan-400/50" />
              <div className="border border-cyan-400/30 bg-black/40 px-2 py-1 backdrop-blur-md">
                <span className="text-[10px] font-mono text-cyan-200">T-04 Wear: 12%</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            animate={{ y: [0, 5, 0] }} 
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-[40%] right-[20%] z-10 hidden xl:block"
          >
            <div className="flex items-center gap-2">
              <div className="border border-cyan-400/30 bg-black/40 px-2 py-1 backdrop-blur-md text-right">
                <span className="text-[10px] font-mono text-cyan-200">Zone A: Nominal</span>
              </div>
              <div className="h-[1px] w-12 bg-cyan-400/50" />
            </div>
          </motion.div>

          <div className="absolute right-10 bottom-10 z-10 hidden xl:block text-right">
             <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-400/60 mb-1">DIGITAL TWIN STATE</p>
             <div className="flex items-center justify-end gap-3">
               <div className="relative grid h-12 w-12 place-items-center rounded-full border border-cyan-400/40 bg-cyan-400/10 backdrop-blur-md">
                 <span className="text-sm font-bold text-cyan-200 drop-shadow-[0_0_5px_currentColor]">96%</span>
                 <svg className="absolute inset-0 h-full w-full -rotate-90">
                   <circle cx="24" cy="24" r="23" fill="none" stroke="rgba(0,212,255,0.2)" strokeWidth="2" />
                   <circle cx="24" cy="24" r="23" fill="none" stroke="rgba(0,212,255,0.8)" strokeWidth="2" strokeDasharray="144" strokeDashoffset="5.76" />
                 </svg>
               </div>
               <div className="text-left">
                 <p className="text-[10px] uppercase text-command-muted">Confidence</p>
                 <p className="text-xs font-bold text-white">98.7%</p>
                 <p className="text-[10px] uppercase text-command-muted mt-1">Latency</p>
                 <p className="text-xs font-bold text-white">18 ms</p>
               </div>
             </div>
          </div>

          {/* MASSIVE START CTA */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 1.5, type: "spring", bounce: 0.6 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 hidden md:block"
          >
            <Link href="/simulator">
              <button className="group relative flex items-center gap-3 overflow-hidden border border-cyan-400/50 bg-cyan-400/[0.1] px-8 py-4 backdrop-blur-md transition-all hover:bg-cyan-400/[0.2] hover:shadow-[0_0_40px_rgba(0,212,255,0.4)] hover:scale-105 active:scale-95">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100 group-hover:animate-[scan_2s_ease-in-out_infinite]" />
                <span className="relative flex h-3 w-3 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-400"></span>
                </span>
                <span className="relative font-mono text-sm font-bold uppercase tracking-[0.3em] text-cyan-100 drop-shadow-[0_0_8px_rgba(0,212,255,0.8)]">
                  Start Simulator Now
                </span>
              </button>
            </Link>
          </motion.div>
        </div>

        {/* Right Rail: Intelligence & KPIs */}
        <motion.div variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }} className="flex flex-col gap-4 z-10">
          <div className="relative overflow-hidden border border-command-line/70 bg-black/20 p-4 backdrop-blur-3xl">
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-cyan-400/80 mb-3">Command Intelligence</h3>
            <p className="text-sm font-semibold text-white">Maintenance Knowledge</p>
            <p className="text-xs text-command-muted mt-1 mb-4">Retrieve proven solutions from operational knowledge base.</p>
            <div className="border border-cyan-400/30 bg-cyan-400/5 p-3">
              <p className="text-[10px] uppercase text-cyan-400/60 mb-1">Top Recommendation</p>
              <p className="text-xs font-bold text-cyan-200">Spindle thermal drift compensation</p>
              <div className="mt-2 flex justify-between text-[10px] text-command-muted">
                <span>Success rate: <span className="text-emerald-400">94%</span></span>
                <span>Used in: <span className="text-white">128 runs</span></span>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden border border-command-line/70 bg-black/20 p-4 backdrop-blur-3xl">
             <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-cyan-400/80 mb-3">Operator Actions</h3>
             <div className="border border-amber-400/30 bg-amber-400/5 p-3">
               <div className="flex justify-between items-start mb-2">
                 <div>
                   <p className="text-xs font-bold text-amber-400">Thermal offset update</p>
                   <p className="text-[10px] text-command-muted mt-0.5">Adjust spindle comp: +2.3 μm</p>
                 </div>
                 <StatusChip status="approval" compact />
               </div>
               <button className="w-full mt-2 border border-amber-400/40 bg-amber-400/10 py-1.5 text-[10px] font-bold tracking-widest text-amber-400 transition-all hover:bg-amber-400/20">REVIEW</button>
             </div>
          </div>

          <div className="relative overflow-hidden border border-command-line/70 bg-black/20 p-4 backdrop-blur-3xl">
             <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-cyan-400/80 mb-3">KPIs - This Shift</h3>
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <p className="text-[10px] uppercase text-command-muted">OEE</p>
                 <p className="text-xl font-bold text-white">89.6%</p>
                 <p className="text-[10px] text-emerald-400">+1.2%</p>
               </div>
               <div>
                 <p className="text-[10px] uppercase text-command-muted">First Pass Yield</p>
                 <p className="text-xl font-bold text-white">98.7%</p>
                 <p className="text-[10px] text-emerald-400">+0.3%</p>
               </div>
               <div>
                 <p className="text-[10px] uppercase text-command-muted">Scrap Rate</p>
                 <p className="text-xl font-bold text-white">0.32%</p>
                 <p className="text-[10px] text-emerald-400">-0.05%</p>
               </div>
               <div>
                 <p className="text-[10px] uppercase text-command-muted">On-Time Delivery</p>
                 <p className="text-xl font-bold text-white">99.1%</p>
                 <p className="text-[10px] text-emerald-400">+1.7%</p>
               </div>
             </div>
          </div>
          
          <div className="relative overflow-hidden border border-command-line/70 bg-black/20 p-4 backdrop-blur-3xl flex-1">
             <div className="flex justify-between items-center mb-3">
               <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-cyan-400/80">System Alerts</h3>
               <span className="text-[10px] text-cyan-400 hover:text-cyan-300 cursor-pointer">View all</span>
             </div>
             <div className="space-y-3">
               <div className="flex gap-2">
                 <Icon name="flow" className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                 <div>
                   <p className="text-xs text-white">Thermal drift trending up</p>
                   <p className="text-[10px] text-command-muted">Spindle 2 - Monitor</p>
                 </div>
               </div>
               <div className="flex gap-2">
                 <Icon name="flow" className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                 <div>
                   <p className="text-xs text-white">Vibration anomaly resolved</p>
                   <p className="text-[10px] text-command-muted">Bearing B2 - Normal</p>
                 </div>
               </div>
             </div>
          </div>

          {/* Global Fleet Command & E-Stop */}
          <div className="relative overflow-hidden border border-red-500/50 bg-red-950/20 p-4 backdrop-blur-3xl">
             <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-red-400 mb-3 flex items-center gap-2">
               <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
               Global Fleet Control
             </h3>
             <div className="space-y-3">
               <div>
                 <p className="text-[9px] uppercase text-red-400/60 mb-1">Fleet Broadcast (HMI Override)</p>
                 <div className="flex gap-2">
                   <input type="text" placeholder="Enter override command..." className="flex-1 bg-black/50 border border-red-500/30 text-xs text-white px-2 py-1 outline-none focus:border-red-500/80" />
                   <button className="bg-red-500/20 text-red-400 text-[10px] font-bold px-3 uppercase border border-red-500/50 hover:bg-red-500/40 transition-colors">TX</button>
                 </div>
               </div>
               <button className="w-full relative group overflow-hidden border border-red-500 bg-red-500/20 py-2 transition-all hover:bg-red-600/40">
                 <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(239,68,68,0.2)_10px,rgba(239,68,68,0.2)_20px)] opacity-50" />
                 <span className="relative text-xs font-black uppercase tracking-[0.2em] text-white drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">
                   Total Plant E-Stop
                 </span>
                 <p className="relative text-[8px] uppercase text-red-200 mt-0.5 tracking-widest">Requires MFA Auth</p>
               </button>
               
               <div className="pt-2 border-t border-red-500/30">
                 <p className="text-[9px] uppercase text-red-400/60 mb-2">Advanced Governance</p>
                 <Link href="/ide" className="block w-full border border-cyan-500/40 bg-cyan-900/20 py-2 text-center text-xs font-bold uppercase tracking-widest text-cyan-400 transition hover:bg-cyan-900/40 hover:text-cyan-300">
                   Smart Contract Policy Editor
                 </Link>
               </div>
             </div>
           </div>
        </motion.div>
      </motion.div>

      {/* Bottom Rail: Scenarios, Traceability, Ledger */}
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="grid grid-cols-[1fr_1fr_1fr] gap-4 z-10">
        
        {/* Scenarios */}
        <div className="relative overflow-hidden border border-command-line/70 bg-black/20 p-4 backdrop-blur-3xl flex flex-col">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-command-muted mb-3">REPLAYABLE TWIN SCENARIOS</span>
          <div className="space-y-2 flex-1">
            <div className="flex justify-between items-center border-b border-command-line/30 pb-2">
              <span className="text-xs text-command-steel">Scenario 1 - Roughing</span>
              <span className="text-[10px] font-bold text-emerald-400">COMPLETED</span>
            </div>
            <div className="flex justify-between items-center border-b border-command-line/30 pb-2">
              <span className="text-xs text-command-steel">Scenario 2 - Thermal Stress</span>
              <span className="text-[10px] font-bold text-emerald-400">COMPLETED</span>
            </div>
            <div className="flex justify-between items-center border-b border-command-line/30 pb-2 bg-amber-400/5 px-2 -mx-2">
              <span className="text-xs font-semibold text-amber-400">Scenario 3 - Finish Turning</span>
              <span className="text-[10px] font-bold text-amber-400">ACTIVE</span>
            </div>
            <div className="flex justify-between items-center pb-2">
              <span className="text-xs text-command-steel">Scenario 4 - Tool Wear</span>
              <span className="text-[10px] font-bold text-cyan-400/60">QUEUED</span>
            </div>
          </div>
          <span className="text-[10px] text-cyan-400 mt-2 cursor-pointer hover:text-cyan-300">View all scenarios &gt;</span>
        </div>

        {/* Traceability */}
        <div className="relative overflow-hidden border border-command-line/70 bg-black/20 p-4 backdrop-blur-3xl flex flex-col">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-command-muted mb-3">PRODUCTION TRACEABILITY</span>
          <div className="mb-4">
            <p className="text-sm font-bold text-white">Lot NT-2025-0517-AX12</p>
          </div>
          <div className="relative border-l border-command-line ml-2 space-y-4 flex-1">
            <div className="relative pl-4">
              <span className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-cyan-400" />
              <p className="text-[10px] text-command-muted uppercase">Raw Material</p>
              <p className="text-xs text-white font-semibold">SUS440C - Heat 9A7721</p>
            </div>
            <div className="relative pl-4">
              <span className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-cyan-400" />
              <p className="text-[10px] text-command-muted uppercase">Operation</p>
              <p className="text-xs text-white font-semibold">Finish Turning - CNC Cell 2</p>
            </div>
            <div className="relative pl-4">
              <span className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-amber-400" />
              <p className="text-[10px] text-amber-400/80 uppercase">Inspection</p>
              <p className="text-xs text-amber-400 font-semibold">In-Process Dimensional</p>
            </div>
          </div>
        </div>

        {/* Evidence Ledger */}
        <div className="relative overflow-hidden border border-command-line/70 bg-black/20 p-4 backdrop-blur-3xl flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-command-muted">EVIDENCE LEDGER</span>
            <StatusChip status="testnet" compact />
          </div>
          <div className="space-y-3 flex-1">
            <div className="grid grid-cols-[1fr_80px_20px] gap-2 items-center border-b border-command-line/30 pb-2">
              <div>
                <p className="text-xs text-white">Process Data</p>
                <p className="text-[10px] text-command-muted">12,450 records</p>
              </div>
              <span className="text-[10px] font-mono text-emerald-400/80">7d3a...9c2b</span>
              <Icon name="check" className="h-3 w-3 text-emerald-400" />
            </div>
            <div className="grid grid-cols-[1fr_80px_20px] gap-2 items-center border-b border-command-line/30 pb-2">
              <div>
                <p className="text-xs text-white">Quality Measurements</p>
                <p className="text-[10px] text-command-muted">512 records</p>
              </div>
              <span className="text-[10px] font-mono text-emerald-400/80">a910...d4e1</span>
              <Icon name="check" className="h-3 w-3 text-emerald-400" />
            </div>
            <div className="grid grid-cols-[1fr_80px_20px] gap-2 items-center">
              <div>
                <p className="text-xs text-white">Machine Signals</p>
                <p className="text-[10px] text-command-muted">4.2M samples</p>
              </div>
              <span className="text-[10px] font-mono text-emerald-400/80">e2d4...1f88</span>
              <Icon name="check" className="h-3 w-3 text-emerald-400" />
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
