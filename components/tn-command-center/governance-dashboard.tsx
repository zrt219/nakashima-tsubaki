"use client";

import { motion, Variants } from "framer-motion";
import { Panel, SystemLine, StatusChip, Icon, ButtonLinkLike, ComparisonBlock } from "./command-center-primitives";
import { governanceItems, overviewEvents } from "@/lib/tn-ai-data";
import type { StatusKind } from "@/lib/tn-ai-data";

export function GovernanceDashboard() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 350, damping: 25 }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid h-full grid-cols-1 lg:grid-cols-[320px_1fr_320px] grid-rows-[1fr_auto] gap-4 xl:gap-6 p-4 xl:p-6"
    >
      {/* Left Column: Risk Heatmap */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4">
        <Panel 
          title="2D Risk Heatmap" 
          kicker="PROBABILITY VS IMPACT" 
          icon="shield"
          accent="amber"
          action={<ButtonLinkLike tone="secondary"><Icon name="search" className="h-4 w-4" /> Scan</ButtonLinkLike>}
        >
          <div className="flex flex-col gap-3 mt-4">
            <div className="grid grid-cols-4 gap-1 h-32 text-[8px] uppercase tracking-wider text-center font-bold">
              <div className="flex flex-col justify-end items-end pr-2 text-command-muted pb-1">Impact →<br/>Prob ↓</div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">Low</div>
              <div className="bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">Med</div>
              <div className="bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">High</div>
              
              <div className="flex items-center justify-end pr-2 text-emerald-400">Low</div>
              <div className="bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-200">2</div>
              <div className="bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-200">1</div>
              <div className="bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-200">0</div>
              
              <div className="flex items-center justify-end pr-2 text-amber-400">Med</div>
              <div className="bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-200">1</div>
              <div className="bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-200">3</div>
              <div className="bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-200 shadow-[inset_0_0_10px_rgba(239,68,68,0.2)]">1</div>
              
              <div className="flex items-center justify-end pr-2 text-red-400">High</div>
              <div className="bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-200">0</div>
              <div className="bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-200">0</div>
              <div className="bg-red-500/40 border border-red-500/60 flex items-center justify-center text-red-100 shadow-[inset_0_0_15px_rgba(239,68,68,0.5)]">0</div>
            </div>
            
            <div className="mt-2 flex flex-col gap-2">
              <ComparisonBlock label="Cyber-Physical Access" text="Air-gapped simulator instance." good={true} />
              <ComparisonBlock label="Model Hallucination" text="Grounded strictly in approved engineering corpus." good={false} />
            </div>
          </div>
        </Panel>
        
        <Panel title="Threat Vectors" kicker="ACTIVE SCORING" icon="chart" accent="violet">
          <div className="flex flex-col gap-2 mt-4">
            <SystemLine label="Unauthorized Access" value="0.00%" />
            <SystemLine label="Data Poisoning" value="0.02%" />
            <SystemLine label="Prompt Injection" value="0.05%" />
            <SystemLine label="Logic Subversion" value="0.00%" />
          </div>
        </Panel>
      </motion.div>

      {/* Center Region: Transparent for Hologram */}
      <motion.div 
        variants={itemVariants} 
        className="relative flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-cyan-400/20 bg-transparent"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,212,255,0.05)_0%,transparent_70%)] pointer-events-none" />
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative flex h-32 w-32 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/5 shadow-[0_0_30px_rgba(0,212,255,0.1)]">
            <Icon name="shield" className="h-12 w-12 text-cyan-400/60" />
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
              className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/20"
            />
            <motion.div 
              animate={{ rotate: -360 }} 
              transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
              className="absolute -inset-4 rounded-full border border-cyan-400/10"
            />
          </div>
          <div className="space-y-1">
            <h3 className="font-mono text-sm tracking-[0.2em] text-cyan-400/60">
              [ COMPLIANCE SHIELD HOLOGRAM REGION ]
            </h3>
            <p className="text-xs text-command-muted">Center left open for 3D overlay visualization</p>
          </div>
        </div>
      </motion.div>

      {/* Right Column: Safety Constraints */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4">
        <Panel 
          title="ISO-27001 Live Compliance Matrix" 
          kicker="CONTINUOUS AUDIT" 
          icon="lock"
          accent="cyan"
        >
          <div className="mt-4 flex flex-col gap-3">
            {[
              { id: "A.9.4.1", title: "Information Access Restriction", status: "advisory" },
              { id: "A.12.4.1", title: "Event Logging", status: "testnet" },
              { id: "A.12.6.1", title: "Vulnerability Management", status: "simulated" },
              { id: "A.14.2.5", title: "Secure System Engineering", status: "advisory" },
              { id: "A.17.1.2", title: "BCP & DR Readiness", status: "ready" }
            ].map((iso) => (
              <div key={iso.id} className="flex justify-between items-center border-b border-command-line/30 pb-2">
                <div>
                  <span className="text-[10px] text-cyan-400 font-mono">{iso.id}</span>
                  <p className="text-xs text-white">{iso.title}</p>
                </div>
                <StatusChip status={iso.status as StatusKind} compact />
              </div>
            ))}
          </div>
          <div className="mt-4 w-full bg-cyan-900/30 h-1.5 rounded-full overflow-hidden">
            <div className="bg-cyan-400 h-full w-[94%]" />
          </div>
          <p className="text-[10px] text-right mt-1 text-cyan-400/60">Overall Compliance: 94%</p>
        </Panel>

        <Panel 
          title="Trust Score Engine" 
          kicker="LIVE AI RELIABILITY" 
          icon="check"
          accent="emerald"
        >
          <div className="flex flex-col items-center justify-center py-6 border-b border-command-line/40 mb-4">
            <div className="relative flex items-center justify-center w-24 h-24 rounded-full border-4 border-emerald-500/20 bg-emerald-500/5 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="none" className="text-emerald-500/10" />
                <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="276" strokeDashoffset="4" className="text-emerald-400" />
              </svg>
              <div className="text-center">
                <span className="text-3xl font-mono font-bold text-white">98</span>
                <span className="text-emerald-400 font-bold text-sm">.5</span>
              </div>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-emerald-400 mt-3 font-bold">System Trust Level: Optimal</p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-command-muted">Data Provenance</span>
              <span className="text-white font-mono">100% (Blockchain Verified)</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-command-muted">Model Confidence (Avg)</span>
              <span className="text-emerald-300 font-mono">99.2%</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-command-muted">Operator Override Rate</span>
              <span className="text-cyan-300 font-mono">1.5% (Nominal)</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-command-muted">Hallucination Index</span>
              <span className="text-emerald-400 font-mono">0.001 (Negligible)</span>
            </div>
          </div>
        </Panel>
      </motion.div>

      {/* Bottom Row: Audit Trail (spans all columns) */}
      <motion.div variants={itemVariants} className="lg:col-span-3">
        <Panel title="Audit Trail" kicker="IMMUTABLE LEDGER" icon="hash" accent="violet">
          <div className="mt-4 grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
            {overviewEvents.map((evt, idx) => (
              <motion.div 
                key={idx} 
                whileHover={{ scale: 1.02, y: -2 }}
                className="flex flex-col gap-2 rounded border border-white/5 bg-black/40 p-3 hover:border-violet-500/30"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] text-command-muted">{evt.timestamp}</span>
                  <StatusChip status={evt.status} compact />
                </div>
                <h4 className="text-xs font-medium text-white line-clamp-1">{evt.event}</h4>
                <p className="text-[10px] leading-tight text-slate-400 line-clamp-2">
                  {evt.payload}
                </p>
                <div className="mt-auto pt-2">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-violet-400/60">
                    SRC: {evt.source}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </Panel>
      </motion.div>

    </motion.div>
  );
}
