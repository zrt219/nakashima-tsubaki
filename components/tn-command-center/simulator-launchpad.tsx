"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { SCENARIOS } from "@/lib/simulator/scenarios";
import { useSimulatorStore } from "@/lib/simulator/store";
import { tutorialStore } from "@/lib/simulator/tutorial-store";
import { CommandCenterShell, ShellActionLink } from "@/components/tn-command-center/command-center-shell";
import { Icon, Panel, StatusChip } from "@/components/tn-command-center/command-center-primitives";
import { AcademicHeader } from "@/components/education/AcademicHeader";

export function SimulatorLaunchpad() {
  const router = useRouter();
  const { setScenario } = useSimulatorStore();
  const [selectedId, setSelectedId] = useState<string | null>(SCENARIOS[0].id);
  const [isStarting, setIsStarting] = useState(false);

  const activeScenario = SCENARIOS.find(s => s.id === selectedId)!;

  const handleStart = () => {
    if (!selectedId) return;
    setIsStarting(true);
    
    // Slight delay for effect
    setTimeout(() => {
      setScenario(selectedId);
      const currentRunId = useSimulatorStore.getState().runId;
      router.push(`/simulator/${currentRunId}`);
    }, 600);
  };

  return (
    <CommandCenterShell
      activeAreaId="twins"
      eventStream={[]}
      utilityActions={
        <>
          <ShellActionLink href="/" label="Executive overview" tone="secondary" />
        </>
      }
    >
      <motion.div 
        className="flex h-full flex-col p-4 xl:p-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
      >
        <AcademicHeader topic="deterministic_twinning" />
        <motion.div id="tutorial-welcome" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.4 } } }} className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">Digital Twin Launchpad</h2>
            <p className="mt-1 text-sm text-slate-300">
              Configure and instantiate a new deterministic digital twin scenario.
            </p>
          </div>
          <button
            onClick={() => tutorialStore.start()}
            className="btn-glow flex items-center gap-2 border border-violet-400/40 bg-violet-400/[0.1] px-4 py-2 text-sm font-semibold text-violet-100 transition-all hover:border-violet-400/80 hover:bg-violet-400/[0.2] hover:shadow-[0_0_20px_rgba(155,109,255,0.3)]"
          >
            <Icon name="play" className="h-4 w-4" />
            Start Guided Tutorial
          </button>
        </motion.div>

        <motion.div 
          className="mt-6 flex flex-1 flex-col gap-6"
          variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { type: "spring", bounce: 0.2 } } }}
        >
          {/* Main Form configuration */}
          <div className="flex-1 space-y-6">
            <div className="border border-command-line/40 bg-black/20 p-5 backdrop-blur-3xl">
              {/* Hero */}
              <section className="scanline relative overflow-hidden border border-command-line/70 bg-gradient-to-br from-command-panel/90 via-command-panel/70 to-command-panel/90 shadow-command backdrop-blur-2xl">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
                <span className="absolute top-0 left-0 h-3 w-3 border-t-2 border-l-2 border-cyan-400/60" />
                <span className="absolute top-0 right-0 h-3 w-3 border-t-2 border-r-2 border-cyan-400/60" />
                <span className="absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-cyan-400/60" />
                <span className="absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-cyan-400/60" />

                <div className="grid gap-4 p-5 xl:p-7">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-cyan-400/70">
                      Simulator Launchpad
                    </p>
                    <h2 className="mt-3 max-w-5xl text-3xl font-semibold leading-tight text-white md:text-4xl xl:text-[2.5rem] xl:leading-[1.15]">
                      <span className="gradient-text-hero">
                        Select a twin scenario, seed the incident,
                      </span>{" "}
                      <span className="text-slate-300">
                        then walk it through a real operator-safe workflow.
                      </span>
                    </h2>
                  </div>
                </div>
              </section>

              <div className="grid gap-3 mt-6">
                <Panel
                  title="Scenario Selection"
                  icon="flow"
                  kicker="Deterministic multi-scenario cyber-physical incident input"
                  action={<StatusChip status="ready" compact />}
                  accent="cyan"
                >
                  <div className="mb-6 grid gap-3 xl:grid-cols-5" id="tutorial-step-seed">
                    {SCENARIOS.map((template) => {
                      const active = template.id === activeScenario.id;

                      return (
                        <button
                          key={template.id}
                          type="button"
                          id={`template-${template.id}`}
                          onClick={() => setSelectedId(template.id)}
                          className={`group relative overflow-hidden border p-4 text-left transition-all duration-200 hover:scale-[1.02] ${
                            active
                              ? "border-cyan-400/40 bg-cyan-400/[0.08] shadow-[0_0_16px_rgba(0,212,255,0.12)]"
                              : "border-command-line/70 bg-black/20 hover:border-cyan-400/25 hover:bg-black/30"
                          }`}
                        >
                          {active && (
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-cyan-400/60 to-transparent" />
                          )}
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-white">{template.name}</p>
                              <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-command-muted">
                                {template.category}
                              </p>
                            </div>
                            <StatusChip status={active ? "ready" : "simulated"} compact />
                          </div>
                          <p className="mt-3 text-xs leading-5 text-slate-400">{template.beginnerSummary}</p>
                          <div className="mt-3 flex gap-2">
                             <span className="border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/70">{template.difficulty}</span>
                             <span className="border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/70">{template.riskLevel} Risk</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      id="create-simulator-run"
                      onClick={handleStart}
                      disabled={isStarting}
                      className="btn-glow flex items-center justify-center gap-2 border border-cyan-400/50 bg-cyan-400/[0.15] py-3 px-5 text-sm font-bold text-cyan-50 transition-all hover:bg-cyan-400/30 hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] disabled:opacity-50"
                    >
                      <Icon name="play" className="h-4 w-4" />
                      {isStarting ? "Initializing Model..." : "Seed Scenario into Twin"}
                    </button>
                  </div>
                </Panel>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </CommandCenterShell>
  );
}
