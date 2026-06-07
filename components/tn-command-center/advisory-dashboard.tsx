"use client";

import { motion } from "framer-motion";
import { Icon, StatusChip } from "@/components/tn-command-center/command-center-primitives";

const seededValue = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export function AdvisoryDashboard() {
  return (
    <div className="flex h-full flex-col gap-4">
      {/* Top Header Metrics */}
      <motion.div 
        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } } }}
        initial="hidden" animate="visible"
        className="grid grid-cols-4 gap-4"
      >
        {[
          { label: "Active Advisory Flows", value: "24", trend: "+3 vs 1h ago", color: "text-cyan-300" },
          { label: "Approved Actions (24h)", value: "128", trend: "+18%", color: "text-emerald-300" },
          { label: "Action Success Rate", value: "98.7%", trend: "+2.1%", color: "text-cyan-300" },
          { label: "Avg. Confidence", value: "93.4%", trend: "+3.8%", color: "text-cyan-300" }
        ].map((metric, i) => (
          <motion.div 
            key={i}
            variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1, transition: { type: "spring", bounce: 0.5 } } }}
            className="relative overflow-hidden border border-command-line/70 bg-black/20 p-4 backdrop-blur-3xl"
          >
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
            <p className="text-[10px] font-semibold uppercase tracking-widest text-command-muted">{metric.label}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={`text-2xl font-bold ${metric.color} drop-shadow-[0_0_8px_currentColor]`}>{metric.value}</span>
              <span className="text-xs font-medium text-emerald-400">{metric.trend}</span>
            </div>
            <div className="mt-2 h-8 w-full">
              <svg viewBox="0 0 100 30" className="h-full w-full opacity-60" preserveAspectRatio="none">
                <path d={`M0 25 Q20 ${10 + seededValue(i * 1.7 + metric.label.length) * 20} 40 15 T80 20 T100 5`} fill="none" stroke="currentColor" strokeWidth="1.5" className={metric.color} />
              </svg>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Grid: Left side, Center (Transparent WebGL), Right Rail */}
      <motion.div 
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } } }}
        initial="hidden" animate="visible"
        className="grid flex-1 grid-cols-[320px_1fr_360px] gap-6 relative"
      >
        {/* Left Side: Signal Detection */}
        <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }} className="flex flex-col gap-4 z-10">
          <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-cyan-400/80">Decision Engine Input</h3>
          
          <div className="relative overflow-hidden border border-command-line/70 bg-black/20 p-4 backdrop-blur-3xl">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-command-muted">SIGNAL DETECTION</span>
              <StatusChip status="simulated" compact />
            </div>
            <div className="flex gap-3 items-start">
              <div className="grid h-10 w-10 shrink-0 place-items-center border border-amber-400/30 bg-amber-400/10 text-amber-400">
                <Icon name="rag" className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Anomaly Detected</p>
                <p className="text-xs text-amber-300">Thermal Drift Rising</p>
                <p className="text-[10px] text-command-muted mt-1">Spindle 2 - Zone A</p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden border border-command-line/70 bg-black/20 p-4 backdrop-blur-3xl mt-4">
            <span className="text-xs font-semibold text-command-muted">RETRIEVAL & CONTEXT</span>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-command-muted">Similar Events</p>
                <p className="text-lg font-bold text-cyan-200">128</p>
              </div>
              <div>
                <p className="text-xs text-command-muted">Patterns</p>
                <p className="text-lg font-bold text-cyan-200">94% match</p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden border border-command-line/70 bg-black/20 p-4 backdrop-blur-3xl mt-4 flex-1">
            <span className="text-xs font-semibold text-command-muted uppercase">Decision Tree</span>
            <div className="mt-4 space-y-4">
              <div className="flex flex-col gap-2 relative">
                <div className="absolute top-4 bottom-4 left-3 w-px bg-cyan-900" />
                <div className="flex gap-3 items-center z-10">
                  <div className="w-6 h-6 rounded-full bg-cyan-900 border border-cyan-500 text-[10px] flex items-center justify-center text-cyan-300">1</div>
                  <div className="text-[10px] text-slate-300">Evaluate Spindle FFT</div>
                </div>
                <div className="flex gap-3 items-center z-10">
                  <div className="w-6 h-6 rounded-full bg-cyan-900 border border-cyan-500 text-[10px] flex items-center justify-center text-cyan-300">2</div>
                  <div className="text-[10px] text-slate-300">Cross-Ref bearing history</div>
                </div>
                <div className="flex gap-3 items-center z-10 pl-6">
                  <div className="w-1 h-1 bg-cyan-500 rounded-full" />
                  <div className="text-[10px] text-emerald-400 font-bold">Match Found (94%)</div>
                </div>
                <div className="flex gap-3 items-center z-10">
                  <div className="w-6 h-6 rounded-full bg-amber-900 border border-amber-500 text-[10px] flex items-center justify-center text-amber-300 animate-pulse">3</div>
                  <div className="text-[10px] text-slate-300">Propose Thermal Offset</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Center Canvas: OPEN FOR WEBGL */}
        <div className="relative flex items-center justify-center">
          {/* We do NOT place opaque backgrounds here. We just place absolute SVG connecting lines and a floating circle outline */}
          
          <div className="absolute inset-0 pointer-events-none">
            <svg className="w-full h-full" style={{ strokeDasharray: "4 4" }}>
              {/* Fake neural pathways from left to center */}
              <path d="M 0 100 C 100 100, 150 200, 300 200" fill="none" stroke="rgba(0,212,255,0.4)" strokeWidth="2" className="animate-[pulse_2s_infinite]" />
              <path d="M 0 300 C 100 300, 150 200, 300 200" fill="none" stroke="rgba(0,212,255,0.4)" strokeWidth="2" className="animate-[pulse_2.5s_infinite]" />
              
              {/* Fake neural pathways from center to right branches */}
              <path d="M 450 200 C 550 200, 600 50, 750 50" fill="none" stroke="rgba(0,212,255,0.8)" strokeWidth="2" className="animate-[pulse_1.5s_infinite]" />
              <path d="M 450 200 C 550 200, 600 150, 750 150" fill="none" stroke="rgba(0,229,160,0.8)" strokeWidth="2" className="animate-[pulse_1.8s_infinite]" />
              <path d="M 450 200 C 550 200, 600 250, 750 250" fill="none" stroke="rgba(245,158,11,0.8)" strokeWidth="2" className="animate-[pulse_2.2s_infinite]" />
              <path d="M 450 200 C 550 200, 600 350, 750 350" fill="none" stroke="rgba(155,109,255,0.8)" strokeWidth="2" className="animate-[pulse_2s_infinite]" />
            </svg>
          </div>

          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute grid h-64 w-64 place-items-center rounded-full border border-cyan-400/20"
          >
            <div className="h-48 w-48 rounded-full border border-cyan-400/40 border-t-cyan-300" />
            <div className="absolute h-40 w-40 rounded-full border border-cyan-400/20 border-b-cyan-200" />
            {/* The absolute center is completely clear to let the 3D particles shine! */}
          </motion.div>
          <div className="absolute text-center z-10 pointer-events-none">
            <h2 className="text-xl font-bold tracking-widest text-cyan-200 drop-shadow-[0_0_12px_rgba(0,212,255,0.8)]">AI ORCHESTRATION</h2>
            <p className="text-xs uppercase tracking-widest text-cyan-400/60">CORE</p>
          </div>

          {/* Right Floating Branches */}
          <div className="absolute right-0 top-10 flex flex-col gap-6 z-10 w-64">
            {[
              { title: "THERMAL DRIFT COMPENSATION", score: "96", conf: "97%", color: "cyan" },
              { title: "TOOL CHANGE RECOMMENDATION", score: "92", conf: "94%", color: "emerald" },
              { title: "FEED OPTIMIZATION", score: "90", conf: "93%", color: "amber" },
              { title: "QUALITY HOLD ACTION", score: "88", conf: "92%", color: "violet" }
            ].map((branch, i) => (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.05, x: -10 }}
                className={`relative overflow-hidden border p-3 backdrop-blur-xl ${
                  branch.color === 'cyan' ? 'border-cyan-400/50 bg-cyan-400/10' :
                  branch.color === 'emerald' ? 'border-emerald-400/50 bg-emerald-400/10' :
                  branch.color === 'amber' ? 'border-amber-400/50 bg-amber-400/10' :
                  'border-violet-400/50 bg-violet-400/10'
                }`}
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-white">{branch.title}</p>
                <div className="mt-2 flex justify-between">
                  <span className="text-xs text-command-muted">Score: <span className="text-white">{branch.score}</span></span>
                  <span className="text-xs text-command-muted">Conf: <span className="text-white">{branch.conf}</span></span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Rail: Details & Governance */}
        <motion.div variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }} className="flex flex-col gap-4 z-10">
          <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-cyan-400/80">Top Recommendation</h3>
          
          <div className="relative overflow-hidden border border-cyan-400/40 bg-cyan-400/5 p-5 backdrop-blur-3xl shadow-[0_0_20px_rgba(0,212,255,0.1)]">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-cyan-200">THERMAL DRIFT COMPENSATION</span>
              <StatusChip status="advisory" compact />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 border-b border-command-line/50 pb-4">
              <div>
                <p className="text-[10px] text-command-muted uppercase">Recommendation Score</p>
                <p className="text-3xl font-bold text-cyan-300 drop-shadow-[0_0_10px_rgba(0,212,255,0.5)]">96<span className="text-sm text-cyan-400/50">/100</span></p>
              </div>
              <div>
                <p className="text-[10px] text-command-muted uppercase">Success Rate</p>
                <p className="text-xl font-bold text-emerald-400">98.7%</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-command-muted">Approval State</span>
                <span className="text-xs font-semibold text-amber-400">Advisory Only</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-command-muted">Rollback Safety</span>
                <span className="text-xs font-semibold text-emerald-400">Safe / Automated</span>
              </div>
              <button className="w-full mt-4 border border-amber-400/40 bg-amber-400/10 py-2 text-xs font-bold text-amber-400 transition-all hover:bg-amber-400/20 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                REVIEW CHECKPOINT
              </button>
            </div>
          </div>
          
          <div className="relative overflow-hidden border border-command-line/70 bg-black/20 p-4 backdrop-blur-3xl mt-4">
            <span className="text-xs font-semibold text-command-muted uppercase flex items-center justify-between">
              SOP Override Matrix
              <span className="text-[8px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1 py-0.5">LEVEL 2</span>
            </span>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-300">Force Execution w/o QA Hold</span>
                <button className="border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 px-2 py-1 text-[9px] text-red-400 font-bold tracking-wider">OVERRIDE</button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-300">Bypass Maintenance Ticket</span>
                <button className="border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 px-2 py-1 text-[9px] text-red-400 font-bold tracking-wider">OVERRIDE</button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-300">Manual Offset Injection</span>
                <button className="border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 px-2 py-1 text-[9px] text-red-400 font-bold tracking-wider">OVERRIDE</button>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden border border-command-line/70 bg-black/20 p-4 backdrop-blur-3xl mt-4 flex-1">
            <span className="text-xs font-semibold text-command-muted">RECENT ADVISORY ACTIVITY</span>
            <div className="mt-4 space-y-4">
              <div className="flex justify-between items-center border-b border-command-line/30 pb-2">
                <div>
                  <p className="text-xs text-emerald-300">Thermal drift comp approved</p>
                  <p className="text-[10px] text-command-muted">3 mins ago</p>
                </div>
                <span className="text-[10px] text-emerald-400">Executed</span>
              </div>
              <div className="flex justify-between items-center border-b border-command-line/30 pb-2">
                <div>
                  <p className="text-xs text-cyan-300">Tool change recommended</p>
                  <p className="text-[10px] text-command-muted">6 mins ago</p>
                </div>
                <span className="text-[10px] text-cyan-400">Recommended</span>
              </div>
              <div className="flex justify-between items-center pb-2">
                <div>
                  <p className="text-xs text-amber-300">Quality hold action</p>
                  <p className="text-[10px] text-command-muted">12 mins ago</p>
                </div>
                <span className="text-[10px] text-amber-400">Under Review</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom Rail: Flow & KPIs */}
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="grid grid-cols-[1fr_400px] gap-4">
        <div className="relative overflow-hidden border border-command-line/70 bg-black/20 p-5 backdrop-blur-3xl">
          <span className="text-xs font-semibold text-command-muted">ADVISORY AUTOMATION FLOW</span>
          <div className="mt-4 flex items-center justify-between text-center">
            {["Signal Detection", "Retrieval", "Output", "Operator Review", "Execution", "Monitor"].map((step, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className={`grid h-8 w-8 place-items-center rounded-full border ${i < 3 ? 'border-cyan-400/50 bg-cyan-400/10 text-cyan-300' : 'border-command-line bg-black text-command-muted'}`}>
                  {i + 1}
                </div>
                <p className={`text-[10px] font-semibold uppercase ${i < 3 ? 'text-cyan-200' : 'text-command-steel'}`}>{step}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative overflow-hidden border border-command-line/70 bg-black/20 p-5 backdrop-blur-3xl">
          <span className="text-xs font-semibold text-command-muted">POLICY-AWARE GATING</span>
          <div className="mt-4 flex items-center justify-between">
            <div className="text-center"><p className="text-xs text-command-muted">Safety</p><p className="text-sm text-emerald-400 font-bold">Compliant</p></div>
            <div className="text-center"><p className="text-xs text-command-muted">Quality</p><p className="text-sm text-emerald-400 font-bold">Compliant</p></div>
            <div className="text-center"><p className="text-xs text-command-muted">Change Ctrl</p><p className="text-sm text-amber-400 font-bold">Required</p></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
