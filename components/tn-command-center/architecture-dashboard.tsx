"use client";

import { motion } from "framer-motion";
import { Icon, StatusChip } from "@/components/tn-command-center/command-center-primitives";

export function ArchitectureDashboard() {
  return (
    <div className="flex h-full flex-col gap-4">
      {/* Top Header Metrics */}
      <motion.div 
        variants={{ hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } } }}
        initial="hidden" animate="visible"
        className="grid grid-cols-5 gap-4 z-10"
      >
        <div className="col-span-2">
          <h2 className="text-3xl font-semibold text-white">Vendor Architecture</h2>
          <p className="text-sm text-cyan-400">Open Stack • Composable by Design • Future Proof by Choice</p>
          <p className="text-xs text-command-muted mt-2">An open, standards-aligned architecture that prevents vendor lock-in while maximizing flexibility.</p>
        </div>
        {[
          { label: "System Health", value: "96", unit: "/100", detail: "Excellent", color: "text-cyan-300" },
          { label: "Architecture Score", value: "93%", detail: "Open & Composable", color: "text-emerald-300" },
          { label: "Integration Points", value: "24", detail: "Active", color: "text-cyan-300" },
          { label: "Data Flows", value: "128", detail: "Live Streams", color: "text-cyan-300" }
        ].map((metric, i) => (
          <motion.div 
            key={i}
            variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1, transition: { type: "spring", bounce: 0.5 } } }}
            className="border border-command-line/40 bg-black/10 p-3 backdrop-blur-md flex flex-col justify-center"
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest text-command-muted">{metric.label}</p>
            <div className="mt-1 flex items-baseline gap-1">
              <span className={`text-2xl font-bold ${metric.color}`}>{metric.value}</span>
              {metric.unit && <span className="text-[10px] font-semibold text-cyan-400/60">{metric.unit}</span>}
            </div>
            <p className="text-[10px] text-command-muted mt-1">{metric.detail}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Grid: Transparent Center with CSS 3D Stack, Right Rail */}
      <motion.div 
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } } }}
        initial="hidden" animate="visible"
        className="grid flex-1 grid-cols-[300px_1fr_360px] gap-6 relative"
      >
        {/* Left Rail: Data Flow Legend */}
        <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }} className="flex flex-col gap-4 z-10">
          <div className="relative overflow-hidden border border-command-line/70 bg-black/20 p-4 backdrop-blur-3xl">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-command-muted mb-3 block">Data Flow Legend</span>
            <div className="space-y-3">
              <div className="flex items-center gap-3"><div className="w-8 border-t border-cyan-400" /><span className="text-xs text-white">Real-time Stream</span></div>
              <div className="flex items-center gap-3"><div className="w-8 border-t border-dashed border-emerald-400" /><span className="text-xs text-white">Batch / Scheduled</span></div>
              <div className="flex items-center gap-3"><div className="w-8 border-t border-amber-400" /><span className="text-xs text-white">Control / Command</span></div>
              <div className="flex items-center gap-3"><div className="w-8 border-t border-dotted border-violet-400" /><span className="text-xs text-white">Sync / Replication</span></div>
            </div>
          </div>
          
          <div className="relative overflow-hidden border border-command-line/70 bg-black/20 p-4 backdrop-blur-3xl flex-1">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-command-muted mb-3 block">Integration Pipelines (Live)</span>
            <div className="space-y-4">
              {[
                { name: "OPC UA Telemetry", to: "Stream Ingest", rate: "12,450 msg/s", color: "cyan" },
                { name: "RAG Context Sync", to: "LLM Gateway", rate: "2,154 req/min", color: "emerald" },
                { name: "Evidence Events", to: "Registry", rate: "1,387 ev/min", color: "amber" },
                { name: "Twin State Sync", to: "Supabase", rate: "845 tx/min", color: "cyan" }
              ].map((pipe, i) => (
                <div key={i} className="flex justify-between items-center border-b border-command-line/30 pb-2">
                  <div>
                    <p className="text-[10px] text-command-muted uppercase">{pipe.name} <span className="text-white">→</span> {pipe.to}</p>
                  </div>
                  <span className={`text-[10px] text-${pipe.color}-400`}>{pipe.rate}</span>
                </div>
              ))}
              <span className="text-[10px] text-cyan-400 cursor-pointer">View all pipelines &gt;</span>
            </div>
          </div>
        </motion.div>

        {/* Center Canvas: OPEN FOR 3D CSS STACK */}
        <div className="relative flex flex-col items-center justify-center pt-20 pb-10 perspective-[2000px]">
          {/* Isometric 3D Stack */}
          <motion.div 
            animate={{ rotateY: [0, -5, 0, 5, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="relative w-full max-w-[600px] h-full flex flex-col items-center justify-end transform-style-3d rotate-x-[60deg] -rotate-z-[30deg] gap-12"
          >
            {[
              { name: "OPERATOR UI LAYER", items: "Dashboards, Alerts, Controls", color: "cyan" },
              { name: "ORCHESTRATION LAYER", items: "Workflows, Policy, Agents", color: "violet" },
              { name: "DIGITAL TWIN ENGINE", items: "Physics, Behavior, Simulation", color: "cyan" },
              { name: "RAG & KNOWLEDGE SERVICES", items: "Retrieval, Embeddings, LLMs", color: "emerald" },
              { name: "EVIDENCE & PROVENANCE", items: "Immutable Records, Signing", color: "amber" },
              { name: "DATA & INTEGRATION LAYER", items: "Normalization, Enrichment", color: "cyan" },
              { name: "EDGE & DEVICE LAYER", items: "Machines, Sensors, PLCs", color: "emerald" }
            ].map((layer, i) => (
              <motion.div 
                key={i}
                whileHover={{ translateZ: "20px", scale: 1.05 }}
                className={`w-full h-24 border bg-black/40 backdrop-blur-md relative transform-style-3d shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center ${
                  layer.color === 'cyan' ? 'border-cyan-400/50 shadow-[inset_0_0_20px_rgba(0,212,255,0.2)]' :
                  layer.color === 'violet' ? 'border-violet-400/50 shadow-[inset_0_0_20px_rgba(139,92,246,0.2)]' :
                  layer.color === 'amber' ? 'border-amber-400/50 shadow-[inset_0_0_20px_rgba(245,158,11,0.2)]' :
                  'border-emerald-400/50 shadow-[inset_0_0_20px_rgba(16,185,129,0.2)]'
                }`}
              >
                {/* 3D Depth faces */}
                <div className={`absolute -bottom-4 left-0 w-full h-4 transform origin-top rotate-x-[-90deg] border border-t-0 bg-black/60 ${
                  layer.color === 'cyan' ? 'border-cyan-400/50' : layer.color === 'violet' ? 'border-violet-400/50' : layer.color === 'amber' ? 'border-amber-400/50' : 'border-emerald-400/50'
                }`} />
                <div className={`absolute -left-4 top-0 w-4 h-full transform origin-right rotate-y-[-90deg] border border-r-0 bg-black/80 ${
                  layer.color === 'cyan' ? 'border-cyan-400/50' : layer.color === 'violet' ? 'border-violet-400/50' : layer.color === 'amber' ? 'border-amber-400/50' : 'border-emerald-400/50'
                }`} />

                <div className="transform translate-Z-10">
                  <p className={`text-xs font-bold uppercase tracking-widest text-${layer.color}-300`}>{layer.name}</p>
                  <p className="text-[10px] text-command-muted mt-1">{layer.items}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Right Rail: Vendor Model & External Services */}
        <motion.div variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }} className="flex flex-col gap-4 z-10">
          <div className="relative overflow-hidden border border-emerald-400/40 bg-emerald-400/5 p-4 backdrop-blur-3xl">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-400">Supabase (Managed)</h3>
              <StatusChip status="testnet" compact />
            </div>
            <div className="space-y-2">
              <div className="border border-emerald-400/20 bg-black/40 p-2 flex items-center gap-3">
                <Icon name="hash" className="h-4 w-4 text-emerald-400" />
                <div><p className="text-[10px] text-emerald-200">PostgreSQL</p><p className="text-[9px] text-command-muted">Operational Database</p></div>
              </div>
              <div className="border border-emerald-400/20 bg-black/40 p-2 flex items-center gap-3">
                <Icon name="lock" className="h-4 w-4 text-emerald-400" />
                <div><p className="text-[10px] text-emerald-200">Auth</p><p className="text-[9px] text-command-muted">SSO & Access Control</p></div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden border border-command-line/70 bg-black/20 p-4 backdrop-blur-3xl">
             <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-cyan-400/80 mb-3">External Services & RAG</h3>
             <div className="space-y-3">
               <div className="flex items-center gap-2">
                 <div className="grid h-6 w-6 place-items-center bg-cyan-400/10 border border-cyan-400/30 text-cyan-400"><Icon name="rag" className="h-3 w-3" /></div>
                 <div><p className="text-[10px] text-white">LLM Providers</p><p className="text-[9px] text-command-muted">OpenAI / Anthropic / Local</p></div>
               </div>
               <div className="flex items-center gap-2">
                 <div className="grid h-6 w-6 place-items-center bg-cyan-400/10 border border-cyan-400/30 text-cyan-400"><Icon name="twin" className="h-3 w-3" /></div>
                 <div><p className="text-[10px] text-white">Embedding Models</p><p className="text-[9px] text-command-muted">Open Source / Custom</p></div>
               </div>
             </div>
          </div>

          <div className="relative overflow-hidden border border-command-line/70 bg-black/20 p-4 backdrop-blur-3xl flex-1">
             <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-cyan-400/80 mb-3">Architecture Metrics</h3>
             <div className="space-y-2">
               <div className="flex justify-between border-b border-command-line/30 pb-1">
                 <span className="text-[10px] text-command-muted">Total Components</span>
                 <span className="text-[10px] text-white">128</span>
               </div>
               <div className="flex justify-between border-b border-command-line/30 pb-1">
                 <span className="text-[10px] text-command-muted">Active Integrations</span>
                 <span className="text-[10px] text-white">24</span>
               </div>
               <div className="flex justify-between border-b border-command-line/30 pb-1">
                 <span className="text-[10px] text-command-muted">Data Flows (Live)</span>
                 <span className="text-[10px] text-white">128</span>
               </div>
             </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom Rail: Vendor Lanes */}
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="grid grid-cols-1 z-10">
        <div className="relative overflow-hidden border border-command-line/70 bg-black/20 p-4 backdrop-blur-3xl">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-command-muted mb-3 block">Vendor Lanes (Connectivity Overview)</span>
          <div className="flex items-center gap-8 border border-command-line/40 bg-black/40 p-4">
            <span className="text-xs text-command-muted w-24">Preferred / Primary</span>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="px-3 py-1 border border-emerald-400/40 text-[10px] text-emerald-400 bg-emerald-400/10">SUPABASE</span>
              <span className="px-3 py-1 border border-cyan-400/40 text-[10px] text-cyan-400 bg-cyan-400/10">OPENAI</span>
              <span className="px-3 py-1 border border-cyan-400/40 text-[10px] text-cyan-400 bg-cyan-400/10">ANTHROPIC</span>
              <span className="px-3 py-1 border border-cyan-400/40 text-[10px] text-cyan-400 bg-cyan-400/10">NVIDIA</span>
              <span className="px-3 py-1 border border-cyan-400/40 text-[10px] text-cyan-400 bg-cyan-400/10">POSTGRES</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
