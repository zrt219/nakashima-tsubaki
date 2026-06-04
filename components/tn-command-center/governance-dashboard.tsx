"use client";

import { motion, Variants } from "framer-motion";
import { Panel, SystemLine, StatusChip, Icon, ButtonLinkLike, ComparisonBlock } from "./command-center-primitives";
import { governanceItems, overviewEvents } from "@/lib/tn-ai-data";

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
          title="Risk Heatmap" 
          kicker="LIVE VECTORS" 
          icon="shield"
          accent="amber"
          action={<ButtonLinkLike tone="secondary"><Icon name="search" className="h-4 w-4" /> Scan</ButtonLinkLike>}
        >
          <div className="flex flex-col gap-3 mt-4">
            <ComparisonBlock 
              label="Cyber-Physical Access" 
              text="Air-gapped simulator instance. No direct PLC connection." 
              good={true} 
            />
            <ComparisonBlock 
              label="Operator Override" 
              text="Approval required for all automation actions. Advisory only." 
              good={true} 
            />
            <ComparisonBlock 
              label="Data Exfiltration" 
              text="External egress blocked. Supabase VPC isolated." 
              good={true} 
            />
            <ComparisonBlock 
              label="Model Hallucination" 
              text="Grounded strictly in approved engineering corpus." 
              good={false} 
            />
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
          title="Safety Constraints" 
          kicker="ENFORCEMENT" 
          icon="lock"
          accent="cyan"
        >
          <div className="mt-4 flex flex-col gap-4">
            {governanceItems.map((item) => (
              <div key={item.title} className="flex flex-col gap-2 rounded-lg border border-white/5 bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.04]">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                  <StatusChip status={item.status} compact />
                </div>
                <div className="space-y-1">
                  <p className="font-mono text-xs text-command-muted">Control: <span className="text-cyan-200">{item.control}</span></p>
                  <p className="text-xs text-slate-400">{item.evidence}</p>
                </div>
              </div>
            ))}
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
