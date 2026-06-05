"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useSimulatorStore } from "@/lib/simulator/use-simulator-store";
import { CommandCenterShell, ShellActionLink } from "@/components/tn-command-center/command-center-shell";
import { Icon, Panel, StatusChip, SystemLine } from "@/components/tn-command-center/command-center-primitives";
import { WORKFLOW_STEPS, type WorkflowStepId } from "@/lib/simulator/types";

export function SimulatorWorkbench({ runId }: { runId: string }) {
  const { runs, advanceStep, setApproval } = useSimulatorStore();
  const run = runs.find(r => r.id === runId);

  if (!run) {
    return (
      <CommandCenterShell activeAreaId="twins" eventStream={[]}>
        <Panel title="Run Not Found" icon="triangle" kicker="Error">
          <p className="text-white">Run not found. Please start a new scenario.</p>
          <Link href="/simulator" className="mt-4 inline-block text-cyan-400">Back to Launchpad</Link>
        </Panel>
      </CommandCenterShell>
    );
  }

  const currentStepIndex = WORKFLOW_STEPS.findIndex(s => s.id === run.currentStep);

  const handleAdvance = () => {
    if (currentStepIndex < WORKFLOW_STEPS.length - 1) {
      // Special logic: if we are at APPROVAL_REQUIRED, we can't just 'advance', we need an approval verdict
      if (run.currentStep === "APPROVAL_REQUIRED") return;

      const nextStep = WORKFLOW_STEPS[currentStepIndex + 1].id;
      advanceStep(nextStep, "system", `Advanced to ${nextStep}`);
    }
  };

  const handleApproval = (gateId: string, status: "approved" | "rejected") => {
    setApproval(gateId, status);
    
    // Check if all are approved
    const allApproved = run.approvals.every(g => g.id === gateId ? status === "approved" : g.status === "approved");
    const anyRejected = run.approvals.some(g => g.id === gateId ? status === "rejected" : g.status === "rejected");

    if (allApproved) {
      advanceStep("ACTION_APPROVED", "operator", "All approvals granted");
      // Auto advance to shadow execution for demo
      setTimeout(() => advanceStep("SHADOW_EXECUTION", "system", "Executing shadow action"), 1000);
    } else if (anyRejected) {
      advanceStep("ACTION_REJECTED", "operator", "Action rejected by operator");
    }
  };

  return (
    <CommandCenterShell
      activeAreaId="twins"
      modelOverride={run.scenarioId as any} // The scenario ID maps roughly to modelId in our mapping
      eventStream={run.events.slice(-5).map(e => ({
        timestamp: new Date(e.timestamp).toLocaleTimeString(),
        source: e.actor,
        event: e.state,
        payload: e.summary,
        status: "simulated"
      }))}
      utilityActions={<ShellActionLink href="/simulator" label="New run" />}
    >
      <motion.div className="flex h-full flex-col gap-4 p-4 xl:p-6" initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}>
        
        {/* Header & Stepper */}
        <motion.div variants={{ hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0 } }} className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
             <h2 className="text-2xl font-bold tracking-tight text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">Digital Twin Command</h2>
             {currentStepIndex < WORKFLOW_STEPS.length - 1 && run.currentStep !== "APPROVAL_REQUIRED" && (
                <button
                  id="tutorial-step-advance"
                  onClick={handleAdvance}
                  className="btn-glow inline-flex items-center gap-2 border border-cyan-400/40 bg-cyan-400/[0.1] px-5 py-2.5 text-sm font-semibold text-cyan-100 transition-all duration-200 hover:bg-cyan-400/[0.18] hover:border-cyan-400/60 hover:shadow-[0_0_24px_rgba(0,212,255,0.3)]"
                >
                  Advance to {WORKFLOW_STEPS[currentStepIndex + 1].label} <Icon name="arrow" className="h-3.5 w-3.5" />
                </button>
             )}
          </div>
          
          <div className="flex w-full items-center gap-1 overflow-x-auto pb-2 scrollbar-none">
            {WORKFLOW_STEPS.slice(1).map((step, idx) => {
              const isActive = step.id === run.currentStep;
              const isPast = idx + 1 < currentStepIndex;
              return (
                <div key={step.id} className="flex min-w-[120px] flex-1 flex-col gap-2">
                  <div className={`h-1.5 w-full rounded-full transition-all duration-500 ${isActive ? "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" : isPast ? "bg-emerald-500/50" : "bg-white/10"}`} />
                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${isActive ? "text-cyan-400" : isPast ? "text-emerald-500/70" : "text-white/30"}`}>{step.label}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Dynamic Panels Layout based on state */}
        <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-3 xl:grid-cols-4 overflow-y-auto">
          
          {/* Signals Panel (Always visible) */}
          <motion.div className="lg:col-span-1" variants={{ hidden: { opacity: 0, y: 40, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", bounce: 0.4, damping: 12 } } }}>
            <Panel title="Telemetry Signals" icon="chart" kicker="Real-time edge streams" action={<StatusChip status="simulated" compact />}>
              <div className="space-y-4">
              {run.signals.map(signal => (
                 <div key={signal.id} className="border border-white/10 bg-black/20 p-3">
                   <div className="flex justify-between text-xs text-slate-400 uppercase tracking-widest mb-2"><span>{signal.label}</span> <span className={signal.status === "critical" ? "text-red-400" : "text-amber-400"}>{signal.status}</span></div>
                   <div className="text-2xl text-white font-mono">{signal.current} <span className="text-sm text-slate-500">{signal.unit}</span></div>
                   <div className="mt-2 h-10 w-full flex items-end gap-1">
                     {signal.trend.map((val, i) => (
                       <div key={i} className="flex-1 bg-cyan-500/30 transition-all" style={{ height: `${(val / (signal.threshold * 1.5)) * 100}%` }} />
                     ))}
                   </div>
                 </div>
              ))}
            </div>
          </Panel>
          </motion.div>

          {/* Environment & Chaos Controls (Phase 5) */}
          <motion.div className="lg:col-span-1" variants={{ hidden: { opacity: 0, y: 40, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", bounce: 0.4, damping: 12, delay: 0.1 } } }}>
            <Panel title="Environment & Chaos" icon="triangle" kicker="Testing Parameters" action={<StatusChip status="simulated" compact />}>
               <div className="space-y-4">
                 <div>
                   <div className="flex justify-between text-[10px] uppercase text-cyan-400 mb-1">
                     <span>Factory Ambient Temp</span>
                     <span className="font-mono text-white">24.5 °C</span>
                   </div>
                   <input type="range" min="15" max="40" defaultValue="24.5" className="w-full h-1 bg-cyan-900/50 appearance-none rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:rounded-full cursor-pointer" />
                 </div>
                 <div>
                   <div className="flex justify-between text-[10px] uppercase text-emerald-400 mb-1">
                     <span>Grid Voltage</span>
                     <span className="font-mono text-white">480 V</span>
                   </div>
                   <input type="range" min="460" max="500" defaultValue="480" className="w-full h-1 bg-emerald-900/50 appearance-none rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-emerald-400 [&::-webkit-slider-thumb]:rounded-full cursor-pointer" />
                 </div>
                 
                 <div className="mt-4 border-t border-red-500/30 pt-4">
                   <h3 className="text-[10px] font-bold uppercase tracking-widest text-red-400 mb-3 flex items-center gap-2">
                     <span className="h-2 w-2 rounded-sm bg-red-500 animate-pulse" />
                     Chaos Monkey Injector
                   </h3>
                   <div className="flex justify-between text-[10px] uppercase text-red-400/80 mb-1">
                     <span>Gaussian Noise Level</span>
                     <span className="font-mono text-white">12%</span>
                   </div>
                   <input type="range" min="0" max="100" defaultValue="12" className="w-full h-1 bg-red-900/50 appearance-none rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-red-400 [&::-webkit-slider-thumb]:rounded-sm cursor-pointer hover:[&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(239,68,68,0.8)] transition-all" />
                   
                   <button className="w-full mt-4 bg-red-500/10 border border-red-500/50 text-red-400 text-[10px] uppercase font-bold py-1.5 hover:bg-red-500/20 transition-colors">
                     Inject Telemetry Spikes
                   </button>
                 </div>
               </div>
            </Panel>
          </motion.div>

          {/* Context & Recommendations */}
          {currentStepIndex >= WORKFLOW_STEPS.findIndex(s => s.id === "CONTEXT_RETRIEVED") && (
            <motion.div className="lg:col-span-1 xl:col-span-2" initial="hidden" animate="visible" variants={{ hidden: { opacity: 0, x: 40, scale: 0.95 }, visible: { opacity: 1, x: 0, scale: 1, transition: { type: "spring", bounce: 0.4, damping: 12 } } }}>
              <Panel title="Advisory Engine" icon="rag" kicker="RAG & Knowledge" action={<StatusChip status="ready" compact />}>
                 {/* Just showing a placeholder since the PRD scenario defines recommendations not full docs */}
               <div className="text-sm text-slate-300">
                 Context retrieval complete. 
               </div>
               {currentStepIndex >= WORKFLOW_STEPS.findIndex(s => s.id === "RECOMMENDATION_GENERATED") && (
                 <div className="mt-4 space-y-4">
                   <h3 className="text-xs uppercase tracking-widest text-cyan-400">Generated Recommendations</h3>
                   <div className="border border-cyan-500/30 bg-cyan-900/10 p-4 shadow-[0_0_15px_rgba(0,212,255,0.1)]">
                      <div className="font-semibold text-white">Advisory Generated</div>
                      <p className="mt-2 text-sm text-slate-300">The AI has produced a safety-checked advisory based on the telemetry.</p>
                   </div>
                 </div>
               )}
              </Panel>
            </motion.div>
          )}

          {/* Operator Decision Gate */}
          {currentStepIndex >= WORKFLOW_STEPS.findIndex(s => s.id === "APPROVAL_REQUIRED") && (
            <motion.div className="lg:col-span-1" initial="hidden" animate="visible" variants={{ hidden: { opacity: 0, y: 40, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", bounce: 0.5, damping: 10 } } }}>
              <Panel title="Operator Gate" icon="shield" kicker="Human in the loop required" action={<StatusChip status="approval" compact />}>
                <div className="space-y-4">
                {run.approvals.map(gate => (
                  <div key={gate.id} className="border border-amber-500/40 bg-amber-900/20 p-4">
                    <div className="text-sm font-bold text-amber-400">{gate.label}</div>
                    <div className="text-xs text-amber-200/70 mt-1">Role Required: {gate.requiredRole}</div>
                    <p className="text-xs text-slate-300 mt-2">{gate.reason}</p>
                    
                    {gate.status === "pending" ? (
                      <div className="mt-4 flex gap-2">
                        <button onClick={() => handleApproval(gate.id, "approved")} className="flex-1 bg-emerald-500/20 border border-emerald-500/50 py-2 text-xs text-emerald-400 hover:bg-emerald-500/30 transition">Approve</button>
                        <button onClick={() => handleApproval(gate.id, "rejected")} className="flex-1 bg-red-500/20 border border-red-500/50 py-2 text-xs text-red-400 hover:bg-red-500/30 transition">Reject</button>
                      </div>
                    ) : (
                      <div className={`mt-4 text-xs font-bold uppercase ${gate.status === "approved" ? "text-emerald-400" : "text-red-400"}`}>
                        {gate.status}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Panel>
            </motion.div>
          )}

          {/* Evidence Capture */}
          {currentStepIndex >= WORKFLOW_STEPS.findIndex(s => s.id === "SHADOW_EXECUTION") && (
            <motion.div className="lg:col-span-1 xl:col-span-4" initial="hidden" animate="visible" variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { type: "spring", bounce: 0.3, damping: 15 } } }}>
              <Panel title="Shadow Execution & Evidence" icon="database" kicker="Immutable capture" action={<StatusChip status="testnet" compact />}>
                 <div className="flex gap-4">
                  <div className="flex-1 border border-cyan-500/30 p-4">
                    <div className="text-sm text-cyan-400 mb-2 font-bold">Shadow Execution</div>
                    <div className="h-2 w-full bg-cyan-900/50 rounded overflow-hidden">
                      <motion.div initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 2 }} className="h-full bg-cyan-400" />
                    </div>
                  </div>
                  {currentStepIndex >= WORKFLOW_STEPS.findIndex(s => s.id === "REPLAY_READY") && (
                    <div className="flex-1 border border-emerald-500/30 p-4 bg-emerald-900/10">
                      <div className="text-sm text-emerald-400 mb-2 font-bold">Evidence Captured</div>
                      <div className="text-xs text-slate-300 font-mono">Hash: 0x8f3c...9a12</div>
                    </div>
                  )}
               </div>
             </Panel>
            </motion.div>
          )}

        </div>
      </motion.div>
    </CommandCenterShell>
  );
}
