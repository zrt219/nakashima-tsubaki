"use client";

import { motion } from "framer-motion";
import { Icon, StatusChip } from "@/components/tn-command-center/command-center-primitives";

export function LedgerDashboard() {
  return (
    <div className="flex h-full flex-col gap-4">
      {/* Top Header Metrics */}
      <motion.div 
        variants={{ hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } } }}
        initial="hidden" animate="visible"
        className="grid grid-cols-4 gap-4 z-10"
      >
        {[
          { label: "Total Hashes", value: "1,245,612", detail: "Immutable Records", color: "text-white" },
          { label: "Network Health", value: "99.9%", detail: "Verifiable", color: "text-emerald-300" },
          { label: "Pending Blocks", value: "14", detail: "Confirming...", color: "text-amber-300" },
          { label: "Sync Latency", value: "12ms", detail: "Global Node", color: "text-cyan-300" }
        ].map((metric, i) => (
          <motion.div 
            key={i}
            variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1, transition: { type: "spring", bounce: 0.5 } } }}
            className="border border-command-line/40 bg-black/10 p-4 backdrop-blur-md"
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest text-command-muted">{metric.label}</p>
            <p className={`mt-2 text-2xl font-bold ${metric.color} drop-shadow-[0_0_8px_currentColor]`}>{metric.value}</p>
            <p className="text-[10px] text-command-muted mt-1">{metric.detail}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Grid: Transparent Center, Right Rail */}
      <motion.div 
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } } }}
        initial="hidden" animate="visible"
        className="grid flex-1 grid-cols-[360px_1fr_360px] gap-6 relative"
      >
        {/* Left Rail: Merkle Inspector & Verifier */}
        <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }} className="flex flex-col gap-4 z-10">
          <div className="relative overflow-hidden border border-command-line/70 bg-black/20 p-4 backdrop-blur-3xl">
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-cyan-400/80 mb-3">Cryptographic Signature Verifier</h3>
            <div className="space-y-3">
              <div>
                <p className="text-[9px] text-command-muted uppercase mb-1">Enter Block Hash or Signature</p>
                <div className="flex gap-2">
                  <input type="text" placeholder="0x..." className="flex-1 bg-black/50 border border-cyan-500/30 text-xs text-white px-2 py-1.5 outline-none focus:border-cyan-500/80 font-mono" />
                  <button className="bg-cyan-500/20 text-cyan-400 text-[10px] font-bold px-3 uppercase border border-cyan-500/50 hover:bg-cyan-500/40 transition-colors">Verify</button>
                </div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden border border-command-line/70 bg-black/20 p-4 backdrop-blur-3xl flex-1 flex flex-col">
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-cyan-400/80 mb-3">Raw Merkle Tree Inspector</h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {/* Mock Merkle Tree visualizer */}
              <div className="border border-cyan-900/50 bg-cyan-900/10 p-2">
                <p className="text-[9px] text-cyan-400 font-mono">ROOT: 0x8a9f...2b1c</p>
                <div className="ml-2 pl-2 border-l border-cyan-900/50 mt-2 space-y-2">
                  <div>
                    <p className="text-[9px] text-emerald-400 font-mono">NODE: 0x1f4...a90 (Valid)</p>
                    <div className="ml-2 pl-2 border-l border-cyan-900/50 mt-1 space-y-1">
                      <p className="text-[8px] text-slate-400 font-mono">LEAF: 0x992...bb1 [Action Approved]</p>
                      <p className="text-[8px] text-slate-400 font-mono">LEAF: 0x3a1...cf9 [Evidence Attached]</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] text-emerald-400 font-mono">NODE: 0x88c...d44 (Valid)</p>
                    <div className="ml-2 pl-2 border-l border-cyan-900/50 mt-1 space-y-1">
                      <p className="text-[8px] text-slate-400 font-mono">LEAF: 0x4d2...ee0 [Telemetry Snapshot]</p>
                      <p className="text-[8px] text-slate-400 font-mono">LEAF: 0x7c9...1f3 [AI Recommendation]</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        {/* Center Canvas: OPEN FOR WEBGL */}
        <div className="relative flex flex-col justify-end pb-10">
          <div className="absolute top-1/3 left-1/4 z-10">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="h-32 w-32 rounded-full border border-dashed border-cyan-400/50"
            />
            <div className="absolute inset-0 grid place-items-center">
              <Icon name="hash" className="h-8 w-8 text-cyan-300 animate-pulse" />
            </div>
            <p className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-mono text-cyan-400 tracking-widest">VERIFYING BLOCK</p>
          </div>
        </div>

        {/* Right Rail: Ledger Entries */}
        <motion.div variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }} className="flex flex-col gap-4 z-10">
          <div className="relative overflow-hidden border border-command-line/70 bg-black/20 p-4 backdrop-blur-3xl flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-cyan-400/80">Real-Time Hash Registry</h3>
              <StatusChip status="testnet" compact />
            </div>
            <div className="space-y-3 flex-1 overflow-y-auto pr-2">
              {[
                { event: "Spindle Offset Adjusted", hash: "0x7a8...9c21", time: "Just now", status: "verified" },
                { event: "Thermal Constraint Exceeded", hash: "0xb41...2e10", time: "2m ago", status: "verified" },
                { event: "Quality Hold Generated", hash: "0x11f...88b2", time: "14m ago", status: "verified" },
                { event: "Operator Approval", hash: "0xc88...4a29", time: "1h ago", status: "verified" },
                { event: "Twin Scenario Replay", hash: "0x9a0...33c4", time: "2h ago", status: "verified" }
              ].map((log, i) => (
                <div key={i} className="border border-command-line/30 bg-black/40 p-3 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white">{log.event}</span>
                    <span className="text-[9px] text-command-muted">{log.time}</span>
                  </div>
                  <div className="flex justify-between items-center bg-black/60 p-1.5 border border-cyan-400/20">
                    <span className="text-[10px] font-mono text-cyan-300">{log.hash}</span>
                    <Icon name="check" className="h-3 w-3 text-emerald-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Autopsy Mode Panel */}
          <div className="relative overflow-hidden border border-purple-500/50 bg-purple-900/10 p-4 backdrop-blur-3xl flex-none shadow-[0_0_20px_rgba(168,85,247,0.15)]">
            <div className="absolute top-0 right-0 p-2 opacity-50">
              <Icon name="search" className="h-20 w-20 text-purple-400 opacity-20" />
            </div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-purple-400">Post-Mortem Autopsy Mode</h3>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
            </div>
            <p className="text-[10px] text-purple-200/70 mb-4 line-clamp-2">
              Reconstruct exact simulator state, UI layout, and telemetry from a verified block hash for RCA (Root Cause Analysis).
            </p>
            <div className="flex gap-2">
              <input type="text" placeholder="Hash to Autopsy..." className="flex-1 bg-black/50 border border-purple-500/30 text-[10px] text-white px-2 py-1.5 outline-none focus:border-purple-500/80 font-mono" defaultValue="0x11f...88b2" />
              <button className="bg-purple-500/20 text-purple-300 text-[9px] font-bold px-3 uppercase border border-purple-500/50 hover:bg-purple-500/40 transition-colors shadow-[0_0_10px_rgba(168,85,247,0.3)]">Extract</button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
