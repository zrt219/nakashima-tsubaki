"use client";

import Link from "next/link";
import { useEffect, useState, useTransition, type ReactNode } from "react";
import {
  advanceSimulationRun,
  getScenarioTemplateProfile,
  getTwinAssetGraph,
  getRunKpis,
  getRunQaChecks,
  getTwinActiveFrameIndex,
  getTwinReplayFrames,
  getWorkflowCardStatus,
  updateRunQuery
} from "@/lib/simulator/engine";
import { getSimulatorPersistenceLabel } from "@/lib/simulator/persistence";
import {
  persistSimulatorRun,
  useSimulatorLatestRun,
  useSimulatorRun,
  useSimulatorRunSummaries
} from "@/lib/simulator/use-simulator-store";
import { type EvidenceItem } from "@/lib/tn-ai-data";
import type { RunSummary, SimulationRun, WorkflowStepId } from "@/lib/simulator/types";
import { CommandCenterShell, ShellActionLink } from "@/components/tn-command-center/command-center-shell";
import {
  Icon,
  Panel,
  StatusChip,
  SystemLine
} from "@/components/tn-command-center/command-center-primitives";

const workflowOrder: WorkflowStepId[] = ["detect", "retrieve", "review", "record"];
type ReviewDraft = {
  runId: string;
  reviewer: string;
  note: string;
};

function getDefaultReviewNote(scenarioId: NonNullable<ReturnType<typeof getScenarioTemplateProfile>["id"]>) {
  if (scenarioId === "thermal_excursion") {
    return "Thermal excursion reviewed and shadow route protection is ready for disposition.";
  }

  if (scenarioId === "spindle_degradation") {
    return "Reliability degradation reviewed and maintenance shadow state is ready for disposition.";
  }

  return "Containment reviewed and ready for disposition.";
}

export function SimulatorWorkbench({ runId }: { runId: string }) {
  const { run, isLoading } = useSimulatorRun(runId);
  const { latestRun } = useSimulatorLatestRun();
  const { recentRuns } = useSimulatorRunSummaries();
  const [reviewDraft, setReviewDraft] = useState<ReviewDraft | null>(null);
  const [isPending, startTransition] = useTransition();

  if (isLoading) {
    return (
      <CommandCenterShell
        activeAreaId="twins"
        eventStream={[
          {
            timestamp: "08:14",
            source: "Workbench",
            event: "Run lookup in progress",
            payload: `${runId} is loading from the persistence adapter`,
            status: "simulated"
          }
        ]}
        utilityActions={<ShellActionLink href="/simulator" label="Open launchpad" />}
        rightRail={<MissingRunRail recentRuns={recentRuns} />}
      >
        <Panel
          title="Loading Twin Run"
          icon="database"
          kicker="Server-backed run state is being retrieved"
          action={<StatusChip status="simulated" compact />}
        >
          <p className="text-sm leading-6 text-slate-300">
            The simulator is loading the requested run from the configured persistence layer.
          </p>
        </Panel>
      </CommandCenterShell>
    );
  }

  if (!run) {
    return (
      <CommandCenterShell
        activeAreaId="twins"
        eventStream={[
          {
            timestamp: "08:14",
            source: "Workbench",
            event: "Run lookup failed",
            payload: `${runId} is not present in local persistence`,
            status: "review"
          },
          {
            timestamp: "08:19",
            source: "Persistence",
            event: "Latest run available",
            payload: latestRun?.lotId ?? "No saved runs",
            status: "locked"
          }
        ]}
        utilityActions={<ShellActionLink href="/simulator" label="Open launchpad" />}
        rightRail={<MissingRunRail recentRuns={recentRuns} />}
      >
        <Panel
          title="Saved Run Not Found"
          icon="triangle"
          kicker="Local persistence did not return the requested run"
          action={<StatusChip status="review" compact />}
        >
          <p className="text-sm leading-6 text-slate-300">
            The requested run ID `{runId}` is not available in browser persistence. Start a new
            incident or resume one of the saved runs from the rail.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/simulator"
              className="border border-cyan-200/60 bg-cyan-300/12 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/18"
            >
              Create new run
            </Link>
            <Link
              href="/"
              className="border border-command-line bg-black/22 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-200/50"
            >
              Executive overview
            </Link>
          </div>
        </Panel>
      </CommandCenterShell>
    );
  }

  const activeRun = run;
  const scenarioProfile = getScenarioTemplateProfile(activeRun.scenarioInput);
  const twinAssetGraph = getTwinAssetGraph(activeRun);
  const reviewer =
    reviewDraft?.runId === activeRun.id ? reviewDraft.reviewer : scenarioProfile.operatorRole;
  const reviewNote =
    reviewDraft?.runId === activeRun.id ? reviewDraft.note : getDefaultReviewNote(scenarioProfile.id);
  const runKpis = getRunKpis(activeRun);
  const qaChecks = getRunQaChecks(activeRun);
  const eventStream = activeRun.events.slice(-4);

  function persistNextRun(nextRun: SimulationRun) {
    void persistSimulatorRun(nextRun);
  }

  function handleAdvance(action: Parameters<typeof advanceSimulationRun>[1]) {
    startTransition(() => {
      persistNextRun(advanceSimulationRun(activeRun, action));
    });
  }

  function handleQueryChange(nextQuery: string) {
    persistNextRun(updateRunQuery(activeRun, nextQuery));
  }

  const primaryAction =
    activeRun.currentStep === "detect"
      ? {
          label: "Advance to approved knowledge retrieval",
          action: () => handleAdvance({ type: "advance_detect" })
        }
      : activeRun.currentStep === "retrieve"
        ? {
            label: "Send recommendation to operator review",
            action: () => handleAdvance({ type: "advance_retrieve" })
          }
        : activeRun.currentStep === "record"
          ? {
              label: "Generate evidence packet",
              action: () => handleAdvance({ type: "generate_evidence" })
            }
          : null;

  return (
    <CommandCenterShell
      activeAreaId="twins"
      eventStream={toEvidenceItems(eventStream)}
      utilityActions={
        <>
          <ShellActionLink href="/simulator" label="New run" />
          <ShellActionLink href="/" label="Executive overview" tone="secondary" />
        </>
      }
      rightRail={<WorkbenchRail run={activeRun} recentRuns={recentRuns} runKpis={runKpis} />}
    >
      <section className="scanline relative overflow-hidden border border-command-line/70 bg-gradient-to-br from-command-panel/90 via-command-panel/70 to-command-panel/90 shadow-command backdrop-blur-2xl">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
        <span className="absolute top-0 left-0 h-3 w-3 border-t-2 border-l-2 border-cyan-400/60" />
        <span className="absolute top-0 right-0 h-3 w-3 border-t-2 border-r-2 border-cyan-400/60" />
        <span className="absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-cyan-400/60" />
        <span className="absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-cyan-400/60" />
        <div className="grid gap-4 p-5 2xl:grid-cols-[minmax(0,1fr)_340px] xl:p-7">
          <div className="min-w-0">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <StatusChip status="simulated" />
              <StatusChip status="advisory" />
              <StatusChip status={activeRun.evidencePacket ? "testnet" : "approval"} compact />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-cyan-400/70">
              Active Simulator Run
            </p>
            <h2 className="mt-3 max-w-5xl text-3xl font-semibold leading-tight md:text-4xl xl:text-[2.5rem] xl:leading-[1.15]">
              <span className="gradient-text-hero">{scenarioProfile.title}</span>{" "}
              <span className="text-slate-300">is active on {activeRun.scenarioInput.lineId} at {activeRun.scenarioInput.facilityId ?? scenarioProfile.presetInput.facilityId}.</span>
            </h2>
            <p className="mt-4 max-w-4xl text-base leading-7 text-slate-400 md:text-lg">
              The incident is deterministic and replayable. Each transition updates the twin,
              retrieval trace, operator-safe shadow control plane, and evidence stream without
              leaving the advisory-first safety boundary.
            </p>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {[
                { label: "Scenario focus", value: scenarioProfile.focusArea.toUpperCase(), accent: "cyan" },
                { label: "Risk level", value: activeRun.risk.riskLevel.toUpperCase(), accent: activeRun.risk.riskLevel === "critical" ? "amber" : "emerald" },
                { label: "Operator role", value: scenarioProfile.operatorRole.toUpperCase(), accent: "violet" }
              ].map(({ label, value, accent }) => (
                <div key={label} className={`relative overflow-hidden border p-4 transition-all duration-200 hover:scale-[1.02] ${
                  accent === "cyan" ? "border-cyan-400/15 bg-cyan-400/[0.04] hover:border-cyan-400/30"
                  : accent === "amber" ? "border-amber-400/25 bg-amber-400/[0.06] hover:border-amber-400/40"
                  : accent === "emerald" ? "border-emerald-400/15 bg-emerald-400/[0.04] hover:border-emerald-400/30"
                  : "border-violet-400/15 bg-violet-400/[0.04] hover:border-violet-400/30"
                }`}>
                  <div className={`absolute top-0 left-0 right-0 h-[1px] ${
                    accent === "cyan" ? "bg-gradient-to-r from-cyan-400/50 to-transparent"
                    : accent === "amber" ? "bg-gradient-to-r from-amber-400/60 to-transparent"
                    : accent === "emerald" ? "bg-gradient-to-r from-emerald-400/50 to-transparent"
                    : "bg-gradient-to-r from-violet-400/50 to-transparent"
                  }`} />
                  <p className="text-xs font-semibold text-command-muted">{label}</p>
                  <p className={`mt-2 text-sm font-bold ${
                    accent === "cyan" ? "text-cyan-200" : accent === "amber" ? "text-amber-200" : accent === "emerald" ? "text-emerald-200" : "text-violet-200"
                  }`}>{value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative overflow-hidden border border-command-line/80 bg-black/30 p-5">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
            <span className="absolute top-0 left-0 h-2 w-2 border-t border-l border-cyan-400/50" />
            <span className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-cyan-400/50" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-command-muted">
              Run Metadata
            </p>
            <div className="mt-4 space-y-0 font-mono text-xs">
              <SystemLine label="Persistence" value={getSimulatorPersistenceLabel().toUpperCase()} />
              <SystemLine label="Facility" value={(activeRun.scenarioInput.facilityId ?? scenarioProfile.presetInput.facilityId ?? "TN-DEMO-01").toUpperCase()} />
              <SystemLine label="Machine" value={(activeRun.scenarioInput.machineId ?? scenarioProfile.presetInput.machineId ?? "CELL-DEMO-01").toUpperCase()} />
              <SystemLine label="Machine authority" value="NO DIRECT PLC CONTROL" />
              <SystemLine label="Approvals" value={activeRun.decision ? activeRun.decision.verdict.toUpperCase() : "PENDING"} />
              <SystemLine label="Evidence" value={activeRun.evidencePacket ? activeRun.evidencePacket.packetId : "NOT GENERATED"} />
            </div>
            {primaryAction ? (
              <button
                type="button"
                onClick={primaryAction.action}
                disabled={isPending}
                className="btn-glow mt-5 inline-flex w-full items-center justify-center gap-2 border border-cyan-400/40 bg-cyan-400/[0.1] px-4 py-3 text-sm font-semibold text-cyan-100 transition-all duration-200 hover:bg-cyan-400/[0.18] hover:border-cyan-400/60 hover:shadow-[0_0_24px_rgba(0,212,255,0.3)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? (
                  <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-300" />Updating run...</>
                ) : (
                  <><Icon name="play" className="h-3.5 w-3.5" />{primaryAction.label}</>
                )}
              </button>
            ) : null}
          </div>
        </div>
      </section>
      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1.18fr)_minmax(380px,0.82fr)]">
        <TwinPanel
          key={`${activeRun.id}-${activeRun.currentStep}-${activeRun.decision?.verdict ?? "pending"}-${activeRun.evidencePacket?.hash ?? "no-hash"}`}
          run={activeRun}
        />
        <RagPanel
          query={activeRun.query}
          onQueryChange={handleQueryChange}
          retrievedDocuments={activeRun.retrievedDocuments}
          recommendationSummary={activeRun.recommendation.summary}
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.82fr)]">
        <WorkflowPanel
          run={activeRun}
          reviewer={reviewer}
          reviewNote={reviewNote}
          onReviewerChange={(value) =>
            setReviewDraft({
              runId: activeRun.id,
              reviewer: value,
              note: reviewNote
            })
          }
          onReviewNoteChange={(value) =>
            setReviewDraft({
              runId: activeRun.id,
              reviewer,
              note: value
            })
          }
          onReview={(verdict) =>
            handleAdvance({
              type: "review",
              verdict,
              reviewer,
              note: reviewNote
            })
          }
        />
        <QaPanel run={activeRun} qaChecks={qaChecks} />
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <LedgerPanel run={activeRun} />
        <TwinAssetGraphPanel assets={twinAssetGraph} />
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <ScenarioContextPanel run={activeRun} />
        <ShadowCommandPanel run={activeRun} />
      </div>
    </CommandCenterShell>
  );
}

function TwinPanel({ run }: { run: SimulationRun }) {
  const frames = getTwinReplayFrames(run);
  const activeFrameIndex = getTwinActiveFrameIndex(run);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState(activeFrameIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const selectedFrame = frames[selectedFrameIndex];

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setSelectedFrameIndex((currentIndex) => {
        if (currentIndex >= frames.length - 1) {
          window.clearInterval(intervalId);
          setIsPlaying(false);
          return currentIndex;
        }

        return currentIndex + 1;
      });
    }, 1400);

    return () => window.clearInterval(intervalId);
  }, [frames.length, isPlaying]);

  function handleFrameSelect(frameIndex: number) {
    setIsPlaying(false);
    setSelectedFrameIndex(frameIndex);
  }

  function handleReplayToggle() {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    if (selectedFrameIndex >= frames.length - 1) {
      setSelectedFrameIndex(0);
    }

    setIsPlaying(true);
  }

  return (
    <Panel
      title="Cyber-Physical Digital Twin"
      icon="twin"
      kicker="Replayable line, lot, control-plane, and evidence state"
      action={<StatusChip status={selectedFrame.status} compact />}
    >
      <div className="space-y-3">
        <div className="relative overflow-hidden border border-command-line/70 bg-black/25 p-4">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-cyan-400/40 via-violet-400/20 to-transparent" />
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-400/60">
                Replay frame {String(selectedFrame.index + 1).padStart(2, "0")} / {String(frames.length).padStart(2, "0")}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-white">{selectedFrame.label}</h3>
              <p className="mt-2.5 text-sm leading-6 text-slate-400">{selectedFrame.narrative}</p>
            </div>
            <div className="shrink-0 space-y-2 text-right">
              <div className="font-mono text-xs font-semibold text-cyan-300">
                {selectedFrame.timestamp}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-command-muted">
                {selectedFrame.mode === "observed" ? "Observed" : "Forecast"}
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-command-line/50 pt-3">
            <p className="text-xs text-command-muted">{selectedFrame.gatingState}</p>
            <span className={`font-mono text-xs font-bold uppercase ${
              selectedFrame.riskLevel === "critical" ? "text-amber-300" :
              selectedFrame.riskLevel === "elevated" ? "text-amber-400/80" : "text-emerald-300"
            }`}>
              Risk: {selectedFrame.riskLevel.toUpperCase()}
            </span>
          </div>
        </div>
        <div className="relative overflow-hidden border border-command-line/70 bg-black/20 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <PlaybackButton
              label="Prev"
              onClick={() => handleFrameSelect(Math.max(selectedFrameIndex - 1, 0))}
              disabled={selectedFrameIndex === 0}
              icon={<Icon name="arrow" className="h-3.5 w-3.5 -scale-x-100 transform" />}
            />
            <PlaybackButton
              label={isPlaying ? "Pause" : "Play replay"}
              onClick={handleReplayToggle}
              icon={<Icon name={isPlaying ? "pause" : "play"} className="h-3.5 w-3.5" />}
            />
            <PlaybackButton
              label="Next"
              onClick={() => handleFrameSelect(Math.min(selectedFrameIndex + 1, frames.length - 1))}
              disabled={selectedFrameIndex === frames.length - 1}
              icon={<Icon name="arrow" className="h-3.5 w-3.5" />}
            />
            <div className="min-w-[180px] flex-1">
              <input
                id="twin-frame-slider"
                type="range"
                min={0}
                max={frames.length - 1}
                value={selectedFrameIndex}
                onChange={(event) => handleFrameSelect(Number(event.target.value))}
                className="w-full accent-cyan-400"
                aria-label="Twin replay position"
              />
            </div>
            <div className="font-mono text-[10px] tabular-nums text-command-muted">
              {selectedFrameIndex + 1} / {frames.length}
            </div>
          </div>
        </div>
        <div className="grid gap-2 md:grid-cols-2 2xl:grid-cols-7">
          {frames.map((frame) => (
            <button
              key={frame.id}
              type="button"
              onClick={() => handleFrameSelect(frame.index)}
              className={`relative overflow-hidden border p-3 text-left transition-all duration-200 hover:scale-[1.02] ${
                selectedFrame.index === frame.index
                  ? "border-cyan-400/40 bg-cyan-400/[0.08] shadow-[0_0_12px_rgba(0,212,255,0.12)]"
                  : frame.index === activeFrameIndex
                    ? "border-amber-400/35 bg-amber-400/[0.06]"
                    : "border-command-line/70 bg-black/20 hover:border-cyan-400/20"
              }`}
            >
              {selectedFrame.index === frame.index && (
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-cyan-400/60 to-transparent" />
              )}
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] text-command-steel">{frame.timestamp}</span>
                <StatusChip status={frame.status} compact />
              </div>
              <p className="mt-2.5 text-xs font-semibold text-white">{frame.label}</p>
              <p className="mt-1 text-[10px] leading-4 text-command-muted">
                {frame.mode === "observed" ? "Observed" : "Forecast"}
              </p>
            </button>
          ))}
        </div>
        <div className="grid gap-4 2xl:grid-cols-[minmax(0,1.12fr)_340px]">
          <div className="space-y-4">
            <div className="relative min-h-[420px] overflow-hidden border border-command-line/70 bg-black/40">
              <div className="absolute inset-0 command-grid opacity-60" />
              {/* Ambient glow */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(0,212,255,0.04),transparent)]" />
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                {/* Primary data flows */}
                <path d="M12 36 C22 22 26 20 34 20" fill="none" stroke="rgba(0,212,255,0.45)" strokeWidth="0.6" />
                <path d="M34 20 C46 18 52 18 60 20" fill="none" stroke="rgba(0,212,255,0.35)" strokeWidth="0.5" />
                {/* Warning path */}
                <path d="M34 20 C38 38 40 50 45 60" fill="none" stroke="rgba(255,184,77,0.5)" strokeWidth="0.6" strokeDasharray="2.5 1.5" />
                {/* Secondary flows */}
                <path d="M45 60 C56 65 60 70 68 76" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.45" />
                <path d="M60 20 C71 27 77 34 84 48" fill="none" stroke="rgba(0,212,255,0.3)" strokeWidth="0.45" />
                <path d="M45 60 C58 56 70 52 84 48" fill="none" stroke="rgba(155,109,255,0.25)" strokeWidth="0.45" />
                {/* Node halos */}
                <circle cx="12" cy="36" r="1.5" fill="rgba(0,212,255,0.2)" />
                <circle cx="34" cy="20" r="1.5" fill="rgba(0,212,255,0.2)" />
                <circle cx="60" cy="20" r="1.5" fill="rgba(0,212,255,0.2)" />
                <circle cx="45" cy="60" r="1.5" fill="rgba(255,184,77,0.3)" />
                <circle cx="84" cy="48" r="1.5" fill="rgba(0,212,255,0.2)" />
              </svg>
              {selectedFrame.nodes.map((node) => (
                <div
                  key={node.id}
                  className="absolute w-[162px] -translate-x-1/2 -translate-y-1/2 border border-command-line/80 bg-command-panel/95 p-3 shadow-command backdrop-blur-md transition-all duration-300 hover:border-cyan-400/30 hover:shadow-[0_0_16px_rgba(0,212,255,0.1)]"
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                >
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-cyan-400/30 to-transparent" />
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-semibold text-white">{node.label}</p>
                    <StatusChip status={node.status} compact />
                  </div>
                  <p className="mt-1.5 text-[10px] uppercase tracking-[0.12em] text-command-muted">{node.state}</p>
                  <p className="mt-2 font-mono text-[10px] font-semibold text-cyan-300">{node.metric}</p>
                  {node.detail ? (
                    <p className="mt-1.5 text-[10px] leading-4 text-slate-400">{node.detail}</p>
                  ) : null}
                </div>
              ))}
            </div>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {selectedFrame.telemetry.map((metric) => (
                <article key={metric.label} className="group relative overflow-hidden border border-command-line/70 bg-black/25 p-3 transition-all duration-200 hover:border-command-line">
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-cyan-400/0 via-cyan-400/25 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-white">{metric.label}</p>
                    <StatusChip status={metric.status} compact />
                  </div>
                  <p className="kpi-value mt-2.5 text-2xl font-semibold text-white">{metric.value}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-cyan-300">{metric.trend}</p>
                  <p className="mt-1.5 text-[10px] leading-4 text-command-muted">{metric.detail}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {/* Subsystem state */}
            <div className="glass-panel relative overflow-hidden p-4">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-cyan-400/40 to-transparent" />
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-white">Subsystem State</h3>
                <Icon name="database" className="h-4 w-4 text-cyan-400/60" />
              </div>
              <div className="space-y-2">
                {selectedFrame.subsystems.map((subsystem) => (
                  <article key={subsystem.id} className="group relative overflow-hidden border border-command-line/60 bg-black/20 p-3 transition-all duration-200 hover:border-command-line">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold text-white">{subsystem.label}</p>
                        <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-command-muted">{subsystem.state}</p>
                      </div>
                      <StatusChip status={subsystem.status} compact />
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-400">{subsystem.detail}</p>
                  </article>
                ))}
              </div>
            </div>
            {/* Shadow writeback matrix */}
            <div className="glass-panel relative overflow-hidden p-4">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-violet-400/40 to-transparent" />
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-white">Shadow Writeback Matrix</h3>
                <Icon name="flow" className="h-4 w-4 text-violet-400/60" />
              </div>
              <div className="space-y-2">
                {selectedFrame.writebacks.map((writeback) => (
                  <article key={`${selectedFrame.id}-${writeback.system}-${writeback.action}`} className="border border-command-line/60 bg-black/20 p-3 transition-all duration-200 hover:border-command-line">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold text-white">{writeback.system}</p>
                        <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-command-muted">{writeback.action}</p>
                      </div>
                      <StatusChip status={writeback.status} compact />
                    </div>
                    <p className="mt-2 font-mono text-[10px] font-semibold uppercase text-violet-300">{writeback.mode}</p>
                    <p className="mt-1.5 text-xs leading-5 text-slate-400">{writeback.detail}</p>
                  </article>
                ))}
              </div>
            </div>
            {/* Risk alerts */}
            <div className="relative overflow-hidden border border-amber-400/20 bg-amber-400/[0.04] p-4">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-amber-400/50 to-transparent" />
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-white">Risk Alerts</h3>
                <Icon name="triangle" className="h-4 w-4 text-amber-400/70" />
              </div>
              <ul className="space-y-2">
                {selectedFrame.alerts.map((alert) => (
                  <li key={alert} className="flex items-start gap-2 text-xs leading-5 text-slate-400">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-400/60" />
                    {alert}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 border border-command-line/50 bg-black/20 px-3 py-2">
          <Icon name="lock" className="h-3.5 w-3.5 shrink-0 text-command-steel" />
          <p className="text-[10px] text-command-muted">
            Twin replays simulated cyber-physical state only. No live equipment, PLC, robot, furnace, grinder, lapper, or safety system is connected or controlled.
          </p>
        </div>
      </div>
    </Panel>
  );
}

function PlaybackButton({
  label,
  onClick,
  icon,
  disabled = false
}: {
  label: string;
  onClick: () => void;
  icon: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="btn-glow inline-flex items-center gap-2 border border-command-line/80 bg-black/20 px-3 py-2 text-xs font-semibold text-command-text transition-all duration-200 hover:border-cyan-400/30 hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function RagPanel({
  query,
  onQueryChange,
  retrievedDocuments,
  recommendationSummary
}: {
  query: string;
  onQueryChange: (value: string) => void;
  retrievedDocuments: SimulationRun["retrievedDocuments"];
  recommendationSummary: string;
}) {
  return (
    <Panel
      title="RAG Knowledge Console"
      icon="rag"
      kicker="Approved corpus retrieval with traceable source cards"
      action={<StatusChip status="simulated" compact />}
      accent="violet"
    >
      <label
        htmlFor="workbench-query"
        className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400/60"
      >
        Live query input
      </label>
      <textarea
        id="workbench-query"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        rows={3}
        className="w-full resize-none border-command-line bg-black/40 font-mono text-xs text-white placeholder:text-command-muted/60 focus:border-violet-400/50 focus:ring-violet-400/20"
        placeholder="Ask about quality, maintenance, compliance, or engineering context..."
      />
      <div className="relative mt-3 overflow-hidden border border-violet-400/20 bg-violet-400/[0.04] p-4">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-violet-400/50 to-transparent" />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-white">Response Summary</p>
          <StatusChip status="advisory" compact />
        </div>
        <p className="mt-2.5 text-xs leading-5 text-slate-400">{recommendationSummary}</p>
      </div>
      <div className="mt-3 space-y-2">
        {retrievedDocuments.map((document) => (
          <article key={document.id} className="group relative overflow-hidden border border-command-line/70 bg-black/20 p-3 transition-all duration-200 hover:border-command-line">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-violet-400/0 via-violet-400/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-[10px] text-command-muted">{document.id}</p>
                <h3 className="mt-0.5 text-xs font-semibold text-white">{document.title}</h3>
              </div>
              <span className="shrink-0 border border-violet-400/40 bg-violet-400/[0.08] px-2 py-0.5 font-mono text-[10px] font-semibold text-violet-200">
                {document.confidence}%
              </span>
            </div>
            <p className="mt-1.5 text-[10px] uppercase tracking-[0.12em] text-command-muted">
              {document.owner} / {document.type}
            </p>
            <p className="mt-1.5 text-[10px] leading-4 text-slate-400">{document.snippet}</p>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function WorkflowPanel({
  run,
  reviewer,
  reviewNote,
  onReviewerChange,
  onReviewNoteChange,
  onReview
}: {
  run: SimulationRun;
  reviewer: string;
  reviewNote: string;
  onReviewerChange: (value: string) => void;
  onReviewNoteChange: (value: string) => void;
  onReview: (verdict: "approve" | "reject" | "escalate") => void;
}) {
  return (
    <Panel
      title="Automation Workflow Simulator"
      icon="flow"
      kicker="Detect, retrieve, review, and record without unsafe direct control"
      action={<StatusChip status="approval" compact />}
    >
      <div className="grid grid-cols-4 gap-2">
        {workflowOrder.map((step, index) => {
          const isActive = run.currentStep === step;
          const isDone = workflowOrder.indexOf(run.currentStep as WorkflowStepId) > index || run.currentStep === "complete";
          return (
            <div
              key={step}
              className={`relative overflow-hidden border p-3 text-center transition-all duration-300 ${
                isActive
                  ? "border-amber-400/50 bg-amber-400/[0.08] shadow-[0_0_12px_rgba(255,184,77,0.15)]"
                  : isDone
                  ? "border-cyan-400/25 bg-cyan-400/[0.05]"
                  : "border-command-line/70 bg-black/20"
              }`}
            >
              {isActive && <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-amber-400/60 to-transparent" />}
              {isDone && !isActive && <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-cyan-400/40 to-transparent" />}
              <p className={`font-mono text-[10px] ${
                isActive ? "text-amber-300" : isDone ? "text-cyan-400" : "text-command-steel"
              }`}>{String(index + 1).padStart(2, "0")}</p>
              <p className={`mt-2 text-xs font-bold ${
                isActive ? "text-amber-100" : isDone ? "text-cyan-200" : "text-command-muted"
              }`}>{step.toUpperCase()}</p>
              <div className="mt-2 flex justify-center">
                <StatusChip status={getWorkflowCardStatus(run, step)} compact />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 relative overflow-hidden border-2 border-amber-400/40 bg-amber-400/[0.06] p-4">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-amber-400/60 via-amber-300/30 to-transparent" />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-white">
            {run.currentStep === "review" ? "Operator decision required" : `Current step: ${run.currentStep}`}
          </h3>
          <StatusChip status={run.currentStep === "complete" ? "testnet" : getWorkflowCardStatus(run, run.currentStep)} compact />
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-200">
          {run.currentStep === "review"
            ? "Record the human decision for the advisory recommendation before evidence generation."
            : "Advance the workflow in order. The simulator enforces advisory-first gates and never claims direct equipment authority."}
        </p>
        {run.currentStep === "review" ? (
          <div className="mt-4 grid gap-4">
            <label className="block text-sm text-slate-300">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-command-muted">
                Reviewer
              </span>
              <input
                value={reviewer}
                onChange={(event) => onReviewerChange(event.target.value)}
                className="w-full border-command-line bg-black/24 text-white focus:border-cyan-200 focus:ring-cyan-200"
              />
            </label>
            <label className="block text-sm text-slate-300">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-command-muted">
                Review note
              </span>
              <textarea
                rows={3}
                value={reviewNote}
                onChange={(event) => onReviewNoteChange(event.target.value)}
                className="w-full resize-none border-command-line bg-black/24 text-white focus:border-cyan-200 focus:ring-cyan-200"
              />
            </label>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onReview("approve")}
                className="btn-glow inline-flex items-center gap-2 border border-cyan-400/40 bg-cyan-400/[0.1] px-4 py-2 text-sm font-semibold text-cyan-100 transition-all duration-200 hover:bg-cyan-400/[0.18] hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(0,212,255,0.25)]"
              >
                <Icon name="check" className="h-3.5 w-3.5" />
                Approve controlled path
              </button>
              <button
                type="button"
                onClick={() => onReview("reject")}
                className="btn-glow inline-flex items-center gap-2 border border-amber-400/40 bg-amber-400/[0.1] px-4 py-2 text-sm font-semibold text-amber-100 transition-all duration-200 hover:bg-amber-400/[0.18] hover:border-amber-400/60"
              >
                <Icon name="triangle" className="h-3.5 w-3.5" />
                Reject and keep block
              </button>
              <button
                type="button"
                onClick={() => onReview("escalate")}
                className="btn-glow inline-flex items-center gap-2 border border-command-line/80 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-command-text transition-all duration-200 hover:border-cyan-400/30"
              >
                <Icon name="shield" className="h-3.5 w-3.5" />
                Escalate to engineering board
              </button>
            </div>
          </div>
        ) : run.decision ? (
          <div className="mt-4 relative overflow-hidden border border-cyan-400/20 bg-cyan-400/[0.04] p-3">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-cyan-400/40 to-transparent" />
            <div className="flex items-center gap-2">
              <Icon name="check" className="h-3.5 w-3.5 shrink-0 text-cyan-300" />
              <p className="text-xs font-semibold text-white">
                Decision: <span className="text-cyan-200">{run.decision.verdict.toUpperCase()}</span> by {run.decision.reviewer}
              </p>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-400">{run.decision.note}</p>
          </div>
        ) : null}
      </div>
    </Panel>
  );
}

function LedgerPanel({ run }: { run: SimulationRun }) {
  const hasEvidence = !!run.evidencePacket;
  return (
    <Panel
      title="Blockchain Provenance Ledger"
      icon="hash"
      kicker="Approval, lot, and model evidence trace"
      action={<StatusChip status={hasEvidence ? "testnet" : "locked"} compact />}
      accent={hasEvidence ? "violet" : "cyan"}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[580px] border-collapse text-left">
          <thead>
            <tr className="border-b border-command-line/70">
              {["Time", "Event", "Source", "Status"].map((h) => (
                <th key={h} className="pb-2.5 pr-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-command-muted first:pl-0">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {run.events.map((event, i) => (
              <tr key={event.id} className={`group border-b border-command-line/40 transition-colors hover:bg-white/[0.02] ${i === run.events.length - 1 ? "border-b-0" : ""}`}>
                <td className="py-2.5 pr-4 font-mono text-[10px] tabular-nums text-command-steel">{event.timestamp}</td>
                <td className="px-3 py-2.5">
                  <span className="block text-xs font-semibold text-white">{event.event}</span>
                  <span className="text-[10px] text-command-muted">{event.payload}</span>
                </td>
                <td className="px-3 py-2.5 text-[10px] text-slate-400">{event.source}</td>
                <td className="py-2.5 pl-3">
                  <StatusChip status={event.status} compact />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={`relative mt-4 overflow-hidden border p-4 ${
        hasEvidence
          ? "border-violet-400/25 bg-violet-400/[0.05]"
          : "border-command-line/70 bg-black/20"
      }`}>
        {hasEvidence && <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-violet-400/60 to-transparent" />}
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-white">Evidence Packet</p>
          {hasEvidence && <Icon name="hash" className="h-4 w-4 text-violet-300" />}
        </div>
        {run.evidencePacket ? (
          <div className="mt-3 space-y-2">
            <p className="font-mono text-[10px] font-semibold text-violet-300">{run.evidencePacket.packetId}</p>
            <p className="text-xs leading-5 text-slate-400">{run.evidencePacket.summary}</p>
            <p className="font-mono text-[9px] break-all text-command-steel">{run.evidencePacket.hash}</p>
          </div>
        ) : (
          <p className="mt-2.5 text-xs leading-5 text-slate-400">
            No evidence packet yet. Complete operator review and generate the record step.
          </p>
        )}
      </div>
    </Panel>
  );
}

function QaPanel({ run, qaChecks }: { run: SimulationRun; qaChecks: string[] }) {
  const isReady = !!run.evidencePacket;
  return (
    <Panel
      title="QA Evidence Report"
      icon="evidence"
      kicker="Verification status for the active simulator run"
      action={<StatusChip status={isReady ? "ready" : "review"} compact />}
      accent={isReady ? "emerald" : "amber"}
    >
      <div className="grid gap-2 md:grid-cols-2">
        {getRunKpis(run).map((kpi) => (
          <article key={kpi.label} className="group relative overflow-hidden border border-command-line/70 bg-black/20 p-3 transition-all duration-200 hover:border-command-line">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-emerald-400/0 via-emerald-400/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-semibold text-white">{kpi.label}</p>
              <StatusChip status={kpi.status} compact />
            </div>
            <div className="mt-2.5 flex items-end justify-between gap-2">
              <p className="kpi-value text-2xl font-semibold text-white">{kpi.value}</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-emerald-300">{kpi.delta}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-3 space-y-1.5">
        {qaChecks.map((check) => (
          <div key={check} className="flex items-start gap-2 text-xs leading-5 text-slate-400">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-400/60" />
            {check}
          </div>
        ))}
      </div>
    </Panel>
  );
}

function TwinAssetGraphPanel({ assets }: { assets: ReturnType<typeof getTwinAssetGraph> }) {
  const depthColors: Record<string, string> = {
    "": "border-l-cyan-400/60",
    "ml-3": "border-l-violet-400/50",
    "ml-6": "border-l-amber-400/40",
    "ml-9": "border-l-emerald-400/40"
  };
  return (
    <Panel
      title="Twin Asset Graph"
      icon="database"
      kicker="Facility-to-system hierarchy for the active replay"
      action={<StatusChip status="simulated" compact />}
    >
      <div className="space-y-2">
        {assets.map((asset) => {
          const indentClass =
            asset.parentId === null
              ? ""
              : asset.kind === "line" || asset.kind === "system"
                ? "ml-3"
                : asset.kind === "cell"
                  ? "ml-6"
                  : "ml-9";

          return (
            <article
              key={asset.id}
              className={`group relative border border-l-2 border-command-line/70 bg-black/20 p-3 transition-all duration-200 hover:border-command-line ${indentClass} ${depthColors[indentClass] ?? "border-l-cyan-400/60"}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-white">{asset.label}</p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-command-muted">
                    {asset.kind} / {asset.state}
                  </p>
                </div>
                <StatusChip status={asset.status} compact />
              </div>
              <p className="mt-2 font-mono text-[10px] font-semibold text-cyan-300">{asset.metric}</p>
              <p className="mt-1.5 text-xs leading-4 text-slate-400">{asset.detail}</p>
            </article>
          );
        })}
      </div>
    </Panel>
  );
}

function ScenarioContextPanel({ run }: { run: SimulationRun }) {
  const scenarioProfile = getScenarioTemplateProfile(run.scenarioInput);

  return (
    <Panel
      title="Scenario Context"
      icon="flow"
      kicker="Twin scenario profile and operating boundary"
      action={<StatusChip status="advisory" compact />}
      accent="emerald"
    >
      <div className="space-y-3">
        <div className="relative overflow-hidden border border-emerald-400/20 bg-emerald-400/[0.04] p-4">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-emerald-400/50 to-transparent" />
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">{scenarioProfile.title}</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-command-muted">
                {scenarioProfile.subtitle}
              </p>
            </div>
            <StatusChip status="ready" compact />
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-400">{scenarioProfile.detail}</p>
        </div>
        <div className="grid gap-2.5 md:grid-cols-2">
          <article className="border border-command-line/70 bg-black/20 p-4 transition-all duration-200 hover:border-command-line">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-400/60">Focus Area</p>
            <p className="mt-2 text-sm font-semibold text-white">{scenarioProfile.focusArea}</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">{scenarioProfile.controlBoundary}</p>
          </article>
          <article className="border border-command-line/70 bg-black/20 p-4 transition-all duration-200 hover:border-command-line">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-400/60">Operator Role</p>
            <p className="mt-2 text-sm font-semibold text-white">{scenarioProfile.operatorRole}</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              Approvals: {run.recommendation.requiredApprovals.join(", ")}
            </p>
          </article>
        </div>
        <article className="border border-amber-400/15 bg-amber-400/[0.03] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-400/60">Missing Context</p>
          <ul className="mt-2.5 space-y-1.5">
            {run.recommendation.missingContext.map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs leading-5 text-slate-400">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-400/50" />
                {item}
              </li>
            ))}
          </ul>
        </article>
      </div>
    </Panel>
  );
}

function ShadowCommandPanel({ run }: { run: SimulationRun }) {
  const activeFrame = getTwinReplayFrames(run)[getTwinActiveFrameIndex(run)];

  return (
    <Panel
      title="Shadow Command Queue"
      icon="twin"
      kicker="Operator-safe control-plane outcomes for the active frame"
      action={<StatusChip status="approval" compact />}
      accent="amber"
    >
      {/* Safety banner */}
      <div className="mb-3 flex items-center gap-2.5 border border-amber-400/25 bg-amber-400/[0.05] px-3 py-2.5">
        <Icon name="lock" className="h-3.5 w-3.5 shrink-0 text-amber-400/70" />
        <p className="text-[10px] font-semibold text-amber-200/80">
          Shadow mode only — no direct PLC or equipment authority
        </p>
      </div>
      <div className="space-y-2.5">
        {activeFrame.writebacks.map((writeback) => (
          <article
            key={`${activeFrame.id}-${writeback.system}-${writeback.action}`}
            className="group relative overflow-hidden border border-command-line/70 bg-black/20 p-4 transition-all duration-200 hover:border-amber-400/20"
          >
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-amber-400/0 via-amber-400/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-white">{writeback.system}</p>
                <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-command-muted">
                  {writeback.action}
                </p>
              </div>
              <StatusChip status={writeback.status} compact />
            </div>
            <p className="mt-2.5 font-mono text-[10px] font-semibold uppercase text-amber-300">{writeback.mode}</p>
            <p className="mt-1.5 text-xs leading-5 text-slate-400">{writeback.detail}</p>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function WorkbenchRail({
  run,
  recentRuns,
  runKpis
}: {
  run: SimulationRun;
  recentRuns: RunSummary[];
  runKpis: ReturnType<typeof getRunKpis>;
}) {
  return (
    <div className="glass-panel relative flex h-full flex-col overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-cyan-400/25 to-transparent" />
      <div className="border-b border-command-line/60 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-400/60">
          Active Run Rail
        </p>
        <h2 className="mt-2 text-lg font-semibold text-white">Operator Workbench</h2>
        <p className="mt-1.5 text-xs leading-5 text-slate-400">
          Execute the incident end to end, then reuse the same run state on refresh.
        </p>
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        <div className="relative overflow-hidden border border-cyan-400/20 bg-cyan-400/[0.04] p-4">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-cyan-400/50 to-transparent" />
          <p className="text-[10px] uppercase tracking-[0.2em] text-command-muted">Current Focus</p>
          <div className="mt-2.5 flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center border border-cyan-400/30 bg-cyan-400/[0.1]">
              <Icon name="flow" className="h-4 w-4 text-cyan-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{run.scenarioName}</p>
              <p className="text-[10px] text-command-muted">
                {(run.scenarioInput.facilityId ?? "TN-DEMO-01")} / {run.scenarioInput.lineId}
              </p>
            </div>
          </div>
        </div>
        <section>
          <div className="mb-2.5 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-white">Run KPIs</h3>
            <Icon name="chart" className="h-4 w-4 text-cyan-400/60" />
          </div>
          <div className="space-y-2">
            {runKpis.map((kpi) => (
              <article key={kpi.label} className="group relative overflow-hidden border border-command-line/70 bg-black/20 p-3 transition-all duration-200 hover:border-command-line">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-cyan-400/0 via-cyan-400/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-white">{kpi.label}</p>
                  <StatusChip status={kpi.status} compact />
                </div>
                <div className="mt-2.5 flex items-end justify-between gap-3">
                  <p className="kpi-value text-2xl font-semibold text-white">{kpi.value}</p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-cyan-300">{kpi.delta}</p>
                </div>
                <p className="mt-1.5 text-[10px] leading-4 text-command-muted">{kpi.detail}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="border border-command-line/70 bg-black/20 p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-white">Recent runs</h3>
            <StatusChip status={recentRuns.length ? "ready" : "locked"} compact />
          </div>
          <div className="mt-3 space-y-2">
            {recentRuns.map((recentRun) => (
              <Link
                key={recentRun.id}
                href={`/simulator/${recentRun.id}`}
                className={`group block border p-3 transition-all duration-200 ${
                  recentRun.id === run.id
                    ? "border-cyan-400/35 bg-cyan-400/[0.06]"
                    : "border-command-line/70 bg-black/20 hover:border-cyan-400/25"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-white">{recentRun.lotId}</p>
                  <Icon name="arrow" className="h-3 w-3 text-command-muted transition-colors group-hover:text-cyan-400" />
                </div>
                <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-command-muted">
                  {recentRun.scenarioName} / {recentRun.currentStep}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function MissingRunRail({ recentRuns }: { recentRuns: RunSummary[] }) {
  return (
    <div className="glass-panel relative flex h-full flex-col overflow-hidden">
      <div className="border-b border-command-line/60 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-400/60">
          Recovery Rail
        </p>
        <h2 className="mt-2 text-lg font-semibold text-white">Saved Run Lookup</h2>
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        <section className="border border-command-line/70 bg-black/20 p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-white">Available runs</h3>
            <StatusChip status={recentRuns.length ? "ready" : "locked"} compact />
          </div>
          <div className="mt-3 space-y-2">
            {recentRuns.length ? (
              recentRuns.map((run) => (
                <Link
                  key={run.id}
                  href={`/simulator/${run.id}`}
                  className="group block border border-command-line/70 bg-black/20 p-3 transition-all duration-200 hover:border-cyan-400/25"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-white">{run.lotId}</p>
                    <Icon name="arrow" className="h-3 w-3 text-command-muted transition-colors group-hover:text-cyan-400" />
                  </div>
                  <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-command-muted">
                    {run.scenarioName} / {run.currentStep}
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-xs leading-5 text-slate-400">No saved runs are available.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function toEvidenceItems(events: SimulationRun["events"]): EvidenceItem[] {
  return events.map((event) => ({
    timestamp: event.timestamp,
    source: event.source,
    event: event.event,
    payload: event.payload,
    status: event.status
  }));
}
