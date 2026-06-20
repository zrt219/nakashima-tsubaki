"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSimulatorStore } from "@/lib/simulator/store";
import { SCENARIOS } from "@/lib/simulator/scenarios";
import type { SimulatorEventType, SimulatorState } from "@/lib/simulator/types";
import { CommandCenterShell, ShellActionLink } from "@/components/tn-command-center/command-center-shell";
import { Icon, Panel, StatusChip } from "@/components/tn-command-center/command-center-primitives";
import { loadReflexMemoryRecords, storeReflexMemoryRecord } from "@/lib/reflex-agents/reflexMemory";
import { LearningTrigger } from "@/components/education/AcademicOverlay";

const WORKFLOW_STEPS: Array<{
  id: SimulatorState;
  label: string;
  eventType?: SimulatorEventType;
}> = [
  { id: "SCENARIO_SELECTED", label: "Ready", eventType: "scenario_selected" },
  { id: "INCIDENT_SEEDED", label: "Incident Seeded", eventType: "incident_seeded" },
  { id: "SIGNAL_DETECTED", label: "Signal Detected", eventType: "signal_detected" },
  { id: "CONTEXT_RETRIEVED", label: "Context Retrieved", eventType: "context_retrieved" },
  { id: "RECOMMENDATION_GENERATED", label: "Recommendation Generated", eventType: "recommendation_generated" },
  { id: "APPROVAL_REQUIRED", label: "Approval Required", eventType: "approval_requested" },
  { id: "SHADOW_EXECUTION_RUNNING", label: "Shadow Execution", eventType: "shadow_execution_started" },
  { id: "REPLAY_READY", label: "Evidence Captured", eventType: "evidence_captured" },
  { id: "RUN_COMPLETE", label: "Run Complete", eventType: "qa_packet_generated" }
];

function normalizeWorkflowState(state: SimulatorState): SimulatorState {
  switch (state) {
    case "ACTION_APPROVED":
    case "SHADOW_EXECUTION_READY":
      return "SHADOW_EXECUTION_RUNNING";
    case "ACTION_REJECTED":
    case "MORE_CONTEXT_REQUESTED":
      return "APPROVAL_REQUIRED";
    case "SHADOW_EXECUTION_COMPLETED":
    case "EVIDENCE_CAPTURED":
    case "QA_PACKET_GENERATED":
      return "REPLAY_READY";
    default:
      return state;
  }
}

export function SimulatorWorkbench({ runId }: { runId: string }) {
  const { runId: storeRunId, activeScenarioId, state, events, transitionState, logEvent } = useSimulatorStore();

  const scenario = SCENARIOS.find(s => s.id === activeScenarioId);
  const effectiveState = normalizeWorkflowState(state);
  const approvalDecision =
    [...events]
      .reverse()
      .find(event => event.type === "operator_approved" || event.type === "operator_rejected")?.type ?? null;

  useEffect(() => {
    if (effectiveState !== state) {
      transitionState(effectiveState);
    }
  }, [effectiveState, state, transitionState]);

  // RECURSIVE MEMORY HOOK: If this is the recursive scenario, check if we have run it before.
  let currentRecommendations = scenario?.recommendations || [];
  let isRecursiveOverride = false;
  
  if (scenario?.id === "scenario-05-recursive-memory") {
    // Has this been approved before in memory?
    const memories = loadReflexMemoryRecords();
    const pastMemory = memories.find(m => m.summary.includes("scenario-05-recursive-memory") && m.type === "run_memory");
    if (pastMemory) {
      isRecursiveOverride = true;
      currentRecommendations = [
        {
          id: "rec-05-recursive-override",
          text: "EMERGENCY M05 SPINDLE STOP",
          rationale: "Recursive Memory Override: I remember that dynamic feed reduction failed to arrest chatter in a previous run. Preemptively halting spindle to prevent catastrophic bearing failure.",
          confidence: 0.99,
          requiresApproval: true,
          shadowActionAvailable: false
        }
      ];
    }
  }

  if (!scenario || storeRunId !== runId) {
    return (
      <CommandCenterShell activeAreaId="twins" eventStream={[]}>
        <Panel title="Run Not Found" icon="triangle" kicker="Error">
          <p className="text-white">Run not found. Please start a new scenario.</p>
          <Link href="/simulator" className="mt-4 inline-block text-cyan-400">
            Back to Launchpad
          </Link>
        </Panel>
      </CommandCenterShell>
    );
  }

  const currentStepIndex = WORKFLOW_STEPS.findIndex(step => step.id === effectiveState);

  const handleAdvance = () => {
    if (currentStepIndex < 0 || currentStepIndex >= WORKFLOW_STEPS.length - 1) return;
    if (effectiveState === "APPROVAL_REQUIRED") return;

    const nextStep = WORKFLOW_STEPS[currentStepIndex + 1];
    transitionState(nextStep.id);
    if (nextStep.eventType) {
      logEvent(nextStep.eventType, "system", `Advanced to ${nextStep.id}`, "info");
    }
  };

  const handleApproval = (_recId: string, status: "approved" | "rejected") => {
    if (status === "approved") {
      logEvent("operator_approved", "operator", "Operator approved recommendation", "success");
      
      // RECURSIVE MEMORY: If they approve scenario-05, let's artificially write a memory so it triggers next time.
      if (scenario?.id === "scenario-05-recursive-memory") {
        storeReflexMemoryRecord({
          id: `run_memory-${storeRunId}-${Date.now()}`,
          type: "run_memory",
          title: `Verified run memory ${storeRunId}`,
          summary: `Verified evidence from telemetry, eval, and operator decision for scenario scenario-05-recursive-memory.`,
          evidence: ["run=" + storeRunId],
          confidence: 0.9,
          sourceRunId: storeRunId,
          createdAt: new Date().toISOString(),
          status: "stored"
        });
      }

      transitionState("SHADOW_EXECUTION_RUNNING");
      logEvent("shadow_execution_started", "system", "Shadow execution staged after operator approval", "info");

      setTimeout(() => {
        transitionState("REPLAY_READY");
        logEvent("shadow_execution_completed", "system", "Shadow execution completed in local demo mode", "success");
        logEvent("evidence_captured", "qa", "Evidence packet captured for replay and audit handoff", "success");
      }, 1000);
      return;
    }

    logEvent("operator_rejected", "operator", "Operator rejected recommendation", "warning");
  };

  const approvalStepIndex = WORKFLOW_STEPS.findIndex(step => step.id === "APPROVAL_REQUIRED");
  const contextStepIndex = WORKFLOW_STEPS.findIndex(step => step.id === "CONTEXT_RETRIEVED");
  const recommendationStepIndex = WORKFLOW_STEPS.findIndex(step => step.id === "RECOMMENDATION_GENERATED");
  const shadowStepIndex = WORKFLOW_STEPS.findIndex(step => step.id === "SHADOW_EXECUTION_RUNNING");
  const replayStepIndex = WORKFLOW_STEPS.findIndex(step => step.id === "REPLAY_READY");

  return (
    <CommandCenterShell
      activeAreaId="twins"
      eventStream={events.slice(-5).map(event => ({
        timestamp: new Date(event.timestamp).toLocaleTimeString(),
        source: event.actor,
        event: event.state,
        payload: event.summary,
        status: "simulated"
      }))}
      utilityActions={<ShellActionLink href="/simulator" label="New run" />}
    >
      <motion.div
        className="flex h-full flex-col gap-4 p-4 xl:p-6"
        initial="hidden"
        animate="visible"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
      >
        <motion.div variants={{ hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0 } }} className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
              Digital Twin Command
            </h2>
            {currentStepIndex > -1 && currentStepIndex < WORKFLOW_STEPS.length - 1 && effectiveState !== "APPROVAL_REQUIRED" && (
              <button
                id="tutorial-step-advance"
                onClick={handleAdvance}
                className="btn-glow inline-flex items-center gap-2 border border-cyan-400/40 bg-cyan-400/[0.1] px-5 py-2.5 text-sm font-semibold text-cyan-100 transition-all duration-200 hover:border-cyan-400/60 hover:bg-cyan-400/[0.18] hover:shadow-[0_0_24px_rgba(0,212,255,0.3)]"
              >
                Advance to {WORKFLOW_STEPS[currentStepIndex + 1]?.label} <Icon name="arrow" className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex w-full items-center gap-1 overflow-x-auto pb-2 scrollbar-none">
            {WORKFLOW_STEPS.map((step, idx) => {
              const isActive = step.id === effectiveState;
              const isPast = idx < currentStepIndex;
              return (
                <div key={step.id} className="flex min-w-[120px] flex-1 flex-col gap-2">
                  <div
                    className={`h-1.5 w-full rounded-full transition-all duration-500 ${
                      isActive
                        ? "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                        : isPast
                          ? "bg-emerald-500/50"
                          : "bg-white/10"
                    }`}
                  />
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider ${
                      isActive ? "text-cyan-400" : isPast ? "text-emerald-500/70" : "text-white/30"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto lg:grid-cols-3 xl:grid-cols-4">
          <motion.div
            className="lg:col-span-1"
            variants={{
              hidden: { opacity: 0, y: 40, scale: 0.95 },
              visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", bounce: 0.4, damping: 12 } }
            }}
          >
            <Panel title="Telemetry Signals" icon="chart" kicker="Real-time edge streams" action={<StatusChip status="simulated" compact />}>
              <div className="space-y-4">
                {scenario.signals.map(signal => (
                  <div key={signal.id} className="border border-white/10 bg-black/20 p-3">
                    <div className="mb-2 flex justify-between text-xs uppercase tracking-widest text-slate-400">
                      <span>{signal.name}</span>
                      <span className="text-amber-400">Normal</span>
                    </div>
                    <div className="font-mono text-2xl text-white">
                      {signal.baseline} <span className="text-sm text-slate-500">{signal.unit}</span>
                    </div>
                    <div className="mt-2 flex h-10 w-full items-end gap-1">
                      <div className="flex-1 bg-cyan-500/30 transition-all" style={{ height: "40%" }} />
                      <div className="flex-1 bg-cyan-500/30 transition-all" style={{ height: "50%" }} />
                      <div className="flex-1 bg-cyan-500/30 transition-all" style={{ height: "45%" }} />
                      <div className="flex-1 bg-cyan-500/30 transition-all" style={{ height: "60%" }} />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </motion.div>

          <motion.div
            className="lg:col-span-1"
            variants={{
              hidden: { opacity: 0, y: 40, scale: 0.95 },
              visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { type: "spring", bounce: 0.4, damping: 12, delay: 0.1 }
              }
            }}
          >
            <Panel title="Environment & Chaos" icon="triangle" kicker="Testing Parameters" action={<StatusChip status="simulated" compact />}>
              <div className="space-y-4">
                <div>
                  <div className="mb-1 flex justify-between text-[10px] uppercase text-cyan-400">
                    <span>Factory Ambient Temp</span>
                    <span className="font-mono text-white">24.5 C</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="40"
                    defaultValue="24.5"
                    className="w-full appearance-none rounded-full bg-cyan-900/50 outline-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 cursor-pointer h-1"
                  />
                </div>

                <div className="mt-4 border-t border-red-500/30 pt-4">
                  <h3 className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-400">
                    <span className="h-2 w-2 animate-pulse rounded-sm bg-red-500" />
                    Chaos Monkey Injector
                  </h3>
                  <button
                    onClick={() => transitionState("INCIDENT_SEEDED")}
                    className="mt-4 w-full border border-red-500/50 bg-red-500/10 py-1.5 text-[10px] font-bold uppercase text-red-400 transition-colors hover:bg-red-500/20"
                  >
                    Inject Telemetry Spikes
                  </button>
                </div>
              </div>
            </Panel>
          </motion.div>

          {currentStepIndex >= contextStepIndex && (
            <motion.div
              className="lg:col-span-1 xl:col-span-2"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0, x: 40, scale: 0.95 },
                visible: { opacity: 1, x: 0, scale: 1, transition: { type: "spring", bounce: 0.4, damping: 12 } }
              }}
            >
              <LearningTrigger topic="recursive_memory">
              <Panel title="Advisory Engine" icon="rag" kicker="RAG & Knowledge" action={<StatusChip status="ready" compact />}>
                <div className="text-sm text-slate-300">Context retrieval complete.</div>
                {currentStepIndex >= recommendationStepIndex && (
                  <div className="mt-4 space-y-4">
                    <h3 className="text-xs uppercase tracking-widest text-cyan-400">
                      {isRecursiveOverride ? "Recursive Memory Triggered" : "Generated Recommendations"}
                    </h3>
                    <div className={`border p-4 shadow-[0_0_15px_rgba(0,212,255,0.1)] ${isRecursiveOverride ? "border-fuchsia-500/50 bg-fuchsia-900/20" : "border-cyan-500/30 bg-cyan-900/10"}`}>
                      <div className={`font-semibold ${isRecursiveOverride ? "text-fuchsia-400" : "text-white"}`}>
                        {isRecursiveOverride ? "Preemptive Override Generated" : "Advisory Generated"}
                      </div>
                      <p className="mt-2 text-sm text-slate-300">{currentRecommendations[0]?.text}</p>
                    </div>
                  </div>
                )}
              </Panel>
              </LearningTrigger>
            </motion.div>
          )}

          {currentStepIndex >= approvalStepIndex && (
            <motion.div
              className="lg:col-span-1"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0, y: 40, scale: 0.95 },
                visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", bounce: 0.5, damping: 10 } }
              }}
            >
              <LearningTrigger topic="recursive_memory">
              <Panel title="Operator Gate" icon="shield" kicker="Human in the loop required" action={<StatusChip status="approval" compact />}>
                <div className="space-y-4">
                  {currentRecommendations.map(rec => (
                    <div key={rec.id} className={`border p-4 ${isRecursiveOverride ? "border-fuchsia-500/40 bg-fuchsia-900/20" : "border-amber-500/40 bg-amber-900/20"}`}>
                      <div className={`text-sm font-bold ${isRecursiveOverride ? "text-fuchsia-400" : "text-amber-400"}`}>{rec.text}</div>
                      <p className="mt-2 text-xs text-slate-300">{rec.rationale}</p>

                      {effectiveState === "APPROVAL_REQUIRED" && !approvalDecision ? (
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => handleApproval(rec.id, "approved")}
                            className="flex-1 border border-emerald-500/50 bg-emerald-500/20 py-2 text-xs text-emerald-400 transition hover:bg-emerald-500/30"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleApproval(rec.id, "rejected")}
                            className="flex-1 border border-red-500/50 bg-red-500/20 py-2 text-xs text-red-400 transition hover:bg-red-500/30"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div
                          className={`mt-4 text-xs font-bold uppercase ${
                            approvalDecision === "operator_approved" ||
                            effectiveState === "SHADOW_EXECUTION_RUNNING" ||
                            effectiveState === "REPLAY_READY" ||
                            effectiveState === "RUN_COMPLETE"
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          {approvalDecision === "operator_approved" ||
                          effectiveState === "SHADOW_EXECUTION_RUNNING" ||
                          effectiveState === "REPLAY_READY" ||
                          effectiveState === "RUN_COMPLETE"
                            ? "approved"
                            : "rejected"}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Panel>
              </LearningTrigger>
            </motion.div>
          )}

          {currentStepIndex >= shadowStepIndex && (
            <motion.div
              className="lg:col-span-1 xl:col-span-4"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0, scale: 0.95 },
                visible: { opacity: 1, scale: 1, transition: { type: "spring", bounce: 0.3, damping: 15 } }
              }}
            >
              <Panel title="Shadow Execution & Evidence" icon="database" kicker="Immutable capture" action={<StatusChip status="testnet" compact />}>
                <div className="flex gap-4">
                  <div className="flex-1 border border-cyan-500/30 p-4">
                    <div className="mb-2 text-sm font-bold text-cyan-400">Shadow Execution</div>
                    <div className="h-2 w-full overflow-hidden rounded bg-cyan-900/50">
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2 }}
                        className="h-full bg-cyan-400"
                      />
                    </div>
                  </div>
                  {currentStepIndex >= replayStepIndex && (
                    <div className="flex-1 border border-emerald-500/30 bg-emerald-900/10 p-4">
                      <div className="mb-2 text-sm font-bold text-emerald-400">Evidence Captured</div>
                      <div className="font-mono text-xs text-slate-300">Hash: 0x8f3c...9a12</div>
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
