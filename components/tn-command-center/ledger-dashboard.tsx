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
        className="grid flex-1 grid-cols-[1fr_360px] gap-6 relative"
      >
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
        </motion.div>
      </motion.div>
    </div>
  );
}
