"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CommandCenterShell, ShellActionLink } from "@/components/tn-command-center/command-center-shell";
import { Icon, StatusChip } from "@/components/tn-command-center/command-center-primitives";
import { overviewEvents } from "@/lib/tn-ai-data";

export function QaDashboard() {
  const [expandedPanel, setExpandedPanel] = useState<string | null>(null);

  return (
    <CommandCenterShell
      activeAreaId="qa"
      rightRail={<div className="hidden lg:block w-0" />} // Hide right rail to use full width
      eventStream={overviewEvents}
      utilityActions={
        <ShellActionLink href="/ledger" label="View Ledger Entry" tone="secondary" />
      }
    >
      <div className="relative h-[calc(100vh-170px)] w-full overflow-hidden rounded-lg border border-cyan-400/20 bg-black/10">
        
        {/* Floating Crosshairs / Canvas Grid */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 border-[0.5px] border-cyan-400/10 rounded-full animate-[spin_120s_linear_infinite]" />
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 border-[0.5px] border-cyan-400/20 rounded-full border-dashed animate-[spin_90s_linear_infinite_reverse]" />
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-cyan-400/10" />
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-cyan-400/10" />
          
          <div className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2">
            <div className="absolute left-0 top-1/2 h-[1px] w-full bg-cyan-400/50" />
            <div className="absolute top-0 left-1/2 h-full w-[1px] bg-cyan-400/50" />
            <div className="absolute inset-0 border border-cyan-400/50 rounded-full" />
          </div>
        </div>

        {/* Floating Callout Tags */}
        <FloatingCallout x="25%" y="30%" label="Ø 24.50 ±0.01" value="24.498" status="PASS" delay={0.4} />
        <FloatingCallout x="70%" y="25%" label="Ra 0.8 max" value="0.65" status="PASS" delay={0.5} />
        <FloatingCallout x="65%" y="65%" label="Concentricity 0.005" value="0.003" status="PASS" delay={0.6} />
        <FloatingCallout x="28%" y="70%" label="Length 150.0 ±0.1" value="150.04" status="PASS" delay={0.7} />

        {/* AI Vision Overlay Tag */}
        <motion.div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 pointer-events-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 1 }}
        >
          <div className="border border-emerald-400/50 bg-black/60 backdrop-blur-md p-3 flex items-center gap-4 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <div className="relative flex h-8 w-8 items-center justify-center border border-emerald-400/30 bg-emerald-400/10">
              <Icon name="search" className="h-4 w-4 text-emerald-400" />
              <div className="absolute inset-0 border border-emerald-400/50 animate-ping opacity-20" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Mock Defect Classifier AI</p>
              <p className="text-xs text-white">No Surface Defects Detected</p>
              <p className="text-[9px] text-command-muted mt-0.5">Vision Confidence: 99.8%</p>
            </div>
          </div>
        </motion.div>

        {/* Left Border Panels */}
        <div className="absolute left-4 top-4 bottom-4 flex w-[320px] flex-col gap-4 pointer-events-auto z-10">
          <motion.div 
            className="flex-none corner-accent glass-panel border border-command-line/70 bg-black/60 backdrop-blur-md p-4 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            <InspectionSummaryPanel />
          </motion.div>
          
          <AnimatePresence>
            {expandedPanel !== "critical" && (
              <motion.div 
                layoutId="critical-panel"
                className="flex-1 corner-accent glass-panel border border-command-line/70 bg-black/60 backdrop-blur-md p-4 shadow-[0_0_20px_rgba(0,0,0,0.5)] flex flex-col min-h-0 cursor-pointer group hover:border-cyan-400/50 transition-colors"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
                onClick={() => setExpandedPanel("critical")}
              >
                <div className="absolute inset-0 bg-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <CriticalCharacteristicsPanel />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-cyan-400/50">
                  <Icon name="search" className="w-4 h-4" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Border Panel */}
        <div className="absolute right-4 top-4 bottom-4 w-[300px] flex flex-col pointer-events-auto z-10">
          <motion.div 
            className="flex-1 corner-accent glass-panel border border-command-line/70 bg-black/60 backdrop-blur-md p-4 shadow-[0_0_20px_rgba(0,0,0,0.5)] flex flex-col min-h-0"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
          >
            <AttachmentsPanel />
          </motion.div>
        </div>

        {/* Center Breakout Overlay */}
        <AnimatePresence>
          {expandedPanel === "critical" && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center pointer-events-auto bg-black/60 backdrop-blur-sm" 
              onClick={() => setExpandedPanel(null)}
            >
              <motion.div
                layoutId="critical-panel"
                className="w-[800px] h-[600px] corner-accent glass-panel border border-cyan-400/80 bg-black/90 backdrop-blur-2xl p-8 shadow-[0_0_50px_rgba(0,212,255,0.15)] flex flex-col cursor-pointer"
                onClick={(e) => { e.stopPropagation(); setExpandedPanel(null); }}
              >
                <div className="absolute top-4 right-4 text-cyan-400/50 hover:text-cyan-400">
                  <Icon name="search" className="w-6 h-6 rotate-90" />
                </div>
                <CriticalCharacteristicsPanel isExpanded />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </CommandCenterShell>
  );
}

function FloatingCallout({ x, y, label, value, status, delay = 0 }: { x: string; y: string; label: string; value: string; status: string; delay?: number }) {
  return (
    <motion.div 
      className="absolute z-20 flex flex-col items-center pointer-events-auto"
      style={{ left: x, top: y }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15, delay }}
    >
      {/* Reticle center point */}
      <div className="relative flex h-4 w-4 items-center justify-center">
        <div className="absolute h-full w-[1px] bg-cyan-400" />
        <div className="absolute w-full h-[1px] bg-cyan-400" />
        <div className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(0,212,255,1)]" />
      </div>
      
      {/* Line connecting to box */}
      <div className="h-8 w-[1px] bg-cyan-400/50" />
      
      {/* Info Box */}
      <div className="border border-cyan-400/50 bg-black/80 backdrop-blur-md px-2 py-1.5 shadow-[0_0_15px_rgba(0,212,255,0.2)] flex flex-col items-center min-w-[120px]">
        <span className="text-[9px] font-semibold uppercase tracking-wider text-cyan-200">{label}</span>
        <div className="flex items-center gap-2 mt-1">
          <span className="font-mono text-sm font-bold text-white">{value}</span>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm ${status === 'PASS' ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30' : 'bg-red-500/20 text-red-500 border border-red-500/30'}`}>{status}</span>
        </div>
      </div>
    </motion.div>
  );
}

function InspectionSummaryPanel() {
  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400/80">Inspection Summary</h3>
        <StatusChip status="approval" compact />
      </div>
      <div className="space-y-3">
        <div className="flex justify-between border-b border-command-line/40 pb-2">
          <span className="text-xs text-command-muted">Lot Number</span>
          <span className="text-xs font-mono text-white">NT-2025-0517-AX12</span>
        </div>
        <div className="flex justify-between border-b border-command-line/40 pb-2">
          <span className="text-xs text-command-muted">Part</span>
          <span className="text-xs font-mono text-white">Precision Spindle SP-44</span>
        </div>
        <div className="flex justify-between border-b border-command-line/40 pb-2">
          <span className="text-xs text-command-muted">Inspector</span>
          <span className="text-xs font-mono text-cyan-300">Auto-CMM AI-4</span>
        </div>
        <div className="flex justify-between border-b border-command-line/40 pb-2">
          <span className="text-xs text-command-muted">Timestamp</span>
          <span className="text-xs font-mono text-white">2026-06-04 11:42 UTC</span>
        </div>
        <div className="pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-command-muted">Disposition</span>
            <span className="px-2.5 py-1 bg-emerald-400/20 text-emerald-400 border border-emerald-400/30 text-[10px] font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(16,185,129,0.2)]">Accepted</span>
          </div>
        </div>
      </div>
    </>
  );
}

function CriticalCharacteristicsPanel({ isExpanded = false }: { isExpanded?: boolean }) {
  const chars = [
    { name: "Main Journal Dia", spec: "24.50 ±0.01", actual: "24.498", dev: "-0.002", status: "PASS" },
    { name: "Surface Roughness", spec: "Ra 0.8 max", actual: "0.65", dev: "-", status: "PASS" },
    { name: "Concentricity", spec: "0.005 max", actual: "0.003", dev: "-", status: "PASS" },
    { name: "Overall Length", spec: "150.0 ±0.1", actual: "150.04", dev: "+0.04", status: "PASS" },
    { name: "Thread Pitch", spec: "1.5 ±0.02", actual: "1.505", dev: "+0.005", status: "PASS" },
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-4 flex-none">
        <h3 className={`font-semibold uppercase tracking-[0.2em] text-cyan-400/80 ${isExpanded ? 'text-lg' : 'text-[10px]'}`}>Characteristics {isExpanded && "Deep Dive Hologram"}</h3>
        <span className={`${isExpanded ? 'text-lg' : 'text-[10px]'} font-bold text-emerald-400`}>5 / 5 Passed</span>
      </div>
      
      <div className={`flex-1 overflow-y-auto pr-2 custom-scrollbar ${isExpanded ? 'space-y-4' : 'space-y-2.5'}`}>
        {chars.map((c, i) => (
          <div key={i} className={`border border-command-line/50 bg-black/30 hover:bg-black/50 transition-colors ${isExpanded ? 'p-4' : 'p-2.5'}`}>
            <div className="flex justify-between items-center mb-2">
              <span className={`font-semibold text-white ${isExpanded ? 'text-base' : 'text-xs'}`}>{c.name}</span>
              <span className={`${isExpanded ? 'text-sm' : 'text-[9px]'} font-bold text-emerald-400`}>{c.status}</span>
            </div>
            <div className={`grid grid-cols-2 gap-2 ${isExpanded ? 'text-sm' : 'text-[10px]'}`}>
              <div>
                <span className="text-command-muted block mb-0.5">SPEC</span>
                <span className="text-slate-300 font-mono">{c.spec}</span>
              </div>
              <div className="text-right">
                <span className="text-command-muted block mb-0.5">ACTUAL</span>
                <span className="text-cyan-300 font-mono">{c.actual}</span>
              </div>
            </div>
            {/* Tolerance Band Visualizer */}
            <div className="mt-2 h-1.5 w-full bg-white/10 relative">
               <div className="absolute top-0 bottom-0 left-[20%] right-[20%] bg-emerald-500/20 border-x border-emerald-500/50" />
               <div className="absolute top-0 bottom-0 w-[2px] bg-cyan-400 shadow-[0_0_5px_rgba(0,212,255,0.8)]" style={{ left: `${40 + ((i * 7) % 20)}%` }} />
               <div className="absolute top-1/2 left-1/2 w-[1px] h-3 bg-white/30 -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function AttachmentsPanel() {
  return (
    <>
      <div className="flex items-center justify-between mb-5 flex-none">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400/80">Evidence Packet</h3>
        <span className="text-[10px] text-command-steel">3 Files</span>
      </div>
      
      <div className="flex-1 space-y-3">
        <AttachmentRow icon="evidence" name="CMM_Report_Final.pdf" size="1.2 MB" />
        <AttachmentRow icon="evidence" name="Surface_Scan_01.png" size="4.5 MB" />
        <AttachmentRow icon="hash" name="Blockchain_Receipt.json" size="12 KB" verified />
        
        <div className="mt-6 border border-amber-400/30 bg-amber-400/[0.05] p-3">
          <div className="flex gap-2">
            <Icon name="shield" className="h-4 w-4 text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-amber-200">Operator Review Required</p>
              <p className="mt-1 text-[10px] text-amber-400/70">Please review CMM data before signing off lot for next operation.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4 flex-none border-t border-command-line/50 space-y-2">
        <button className="w-full border border-cyan-400/30 bg-cyan-400/10 py-2.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300 hover:bg-cyan-400/20 hover:text-white transition-all shadow-[0_0_10px_rgba(0,212,255,0.1)] hover:shadow-[0_0_15px_rgba(0,212,255,0.2)]">
          Download Packet
        </button>
        <button className="w-full border border-emerald-400/40 bg-emerald-400/15 py-2.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300 hover:bg-emerald-400/25 hover:text-white transition-all shadow-[0_0_10px_rgba(16,185,129,0.1)] hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2">
          <Icon name="check" className="h-3.5 w-3.5" /> Cryptographic Sign-Off
        </button>
      </div>
    </>
  );
}

function AttachmentRow({ icon, name, size, verified }: { icon: string; name: string; size: string; verified?: boolean }) {
  return (
    <div className="flex items-start gap-3 p-2.5 border border-command-line/40 bg-black/40 hover:bg-black/60 transition-colors group cursor-pointer">
      <div className="mt-0.5">
        <Icon name={icon as Parameters<typeof Icon>[0]["name"]} className="h-4 w-4 text-cyan-400/70 group-hover:text-cyan-300 transition-colors" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-white truncate">{name}</p>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-[10px] font-mono text-command-muted">{size}</span>
          {verified && (
            <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
              <Icon name="check" className="h-3 w-3" /> Verified
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
