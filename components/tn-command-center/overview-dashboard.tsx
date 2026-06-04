"use client";

import Link from "next/link";
import {
  governanceItems,
  overviewEvents,
  overviewKpis,
  roadmap,
  vendorLayers
} from "@/lib/tn-ai-data";
import { useSimulatorLatestRun } from "@/lib/simulator/use-simulator-store";
import type { RunSummary } from "@/lib/simulator/types";
import { CommandCenterShell, ShellActionLink } from "@/components/tn-command-center/command-center-shell";
import {
  ComparisonBlock,
  Icon,
  Panel,
  StatusChip
} from "@/components/tn-command-center/command-center-primitives";

export function OverviewDashboard() {
  const { latestRun } = useSimulatorLatestRun();

  return (
    <CommandCenterShell
      activeAreaId="overview"
      eventStream={overviewEvents}
      utilityActions={
        <>
          <ShellActionLink href="/simulator" label="Launch simulator" />
          {latestRun ? (
            <ShellActionLink href={`/simulator/${latestRun.id}`} label="Resume latest" tone="secondary" />
          ) : null}
        </>
      }
      rightRail={<OverviewRail latestRun={latestRun} />}
    >
      <OverviewHero latestRun={latestRun} />
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)]">
        <RoadmapPanel />
        <RecentRunPanel latestRun={latestRun} />
      </div>
      <div className="grid gap-3 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <VendorPanel />
        <GovernancePanel />
      </div>
    </CommandCenterShell>
  );
}

function OverviewHero({ latestRun }: { latestRun: RunSummary | null }) {
  return (
    <section className="scanline relative overflow-hidden border border-command-line/70 bg-gradient-to-br from-command-panel/90 via-command-panel/70 to-command-panel/90 shadow-command backdrop-blur-2xl">
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

      {/* Corner accents */}
      <span className="absolute top-0 left-0 h-3 w-3 border-t-2 border-l-2 border-cyan-400/60" />
      <span className="absolute top-0 right-0 h-3 w-3 border-t-2 border-r-2 border-cyan-400/60" />
      <span className="absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-cyan-400/60" />
      <span className="absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-cyan-400/60" />

      {/* Decorative glow orb */}
      <div
        className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full opacity-60"
        style={{
          background:
            "radial-gradient(circle, rgba(0,212,255,0.1) 0%, rgba(155,109,255,0.06) 40%, transparent 70%)",
          filter: "blur(20px)"
        }}
        aria-hidden="true"
      />

      <div className="grid gap-4 p-5 2xl:grid-cols-[minmax(0,1fr)_340px] xl:p-7">
        {/* Main copy */}
        <div className="min-w-0">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <StatusChip status="simulated" />
            <StatusChip status="advisory" />
            <StatusChip status="locked" compact />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-cyan-400/70">
            Strategic Answer
          </p>
          <h2 className="mt-3 max-w-5xl text-3xl font-semibold leading-tight text-white md:text-4xl xl:text-[2.6rem] xl:leading-[1.15]">
            <span className="gradient-text-hero">
              Turn the prototype into a replayable cyber-physical twin lab,
            </span>{" "}
            <span className="text-slate-300">
              then harden the same workflow for persistence.
            </span>
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-7 text-slate-400 md:text-lg">
            The command center now has a stronger v1 target: multiple deterministic incident loops
            that combine twin state, knowledge retrieval, human review, shadow control outputs, and
            evidence generation without unsafe automation claims.
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[
              {
                title: "Three scenario lab",
                detail: "Run quality containment, thermal excursion, and spindle degradation through the same twin workflow.",
                accent: "cyan"
              },
              {
                title: "Real workflow",
                detail: "Drive detect, retrieve, review, and record as a replayable state machine.",
                accent: "violet"
              },
              {
                title: "Backend ready",
                detail: "Keep local persistence live now and stage the Supabase boundary for the next phase.",
                accent: "emerald"
              }
            ].map(({ title, detail, accent }) => (
              <div
                key={title}
                className={`relative overflow-hidden border p-4 transition-all duration-200 hover:scale-[1.02] ${
                  accent === "cyan"
                    ? "border-cyan-400/15 bg-cyan-400/[0.04] hover:border-cyan-400/30"
                    : accent === "violet"
                    ? "border-violet-400/15 bg-violet-400/[0.04] hover:border-violet-400/30"
                    : "border-emerald-400/15 bg-emerald-400/[0.04] hover:border-emerald-400/30"
                }`}
              >
                <div
                  className={`absolute top-0 left-0 right-0 h-[1px] ${
                    accent === "cyan"
                      ? "bg-gradient-to-r from-cyan-400/50 to-transparent"
                      : accent === "violet"
                      ? "bg-gradient-to-r from-violet-400/50 to-transparent"
                      : "bg-gradient-to-r from-emerald-400/50 to-transparent"
                  }`}
                />
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="mt-2 text-xs leading-5 text-command-muted">{detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Milestone card */}
        <div className="relative overflow-hidden border border-command-line/80 bg-black/30 p-5">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-400/30 to-transparent" />
          <span className="absolute top-0 left-0 h-2 w-2 border-t border-l border-violet-400/50" />
          <span className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-violet-400/50" />

          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-command-muted">
            Active Milestone
          </p>
          <div className="mt-4 flex items-start gap-3">
            <div className="grid h-12 w-12 place-items-center border border-violet-400/30 bg-violet-400/[0.08] shadow-[0_0_16px_rgba(155,109,255,0.2)]">
              <Icon name="flow" className="h-6 w-6 text-violet-300" />
            </div>
            <div>
              <p className="text-base font-semibold text-white">Quality Hold Simulator V1</p>
              <p className="mt-0.5 text-xs text-command-muted">Single-user, persisted, advisory-first workflow</p>
            </div>
          </div>
          <div className="mt-5 space-y-0 font-mono text-xs">
            {[
              { label: "Mode", value: "LOCAL PERSISTENCE" },
              { label: "Scenario", value: "3 TWIN SCENARIOS" },
              { label: "Machine authority", value: "NO DIRECT PLC CONTROL" },
              { label: "Latest run", value: latestRun ? latestRun.lotId : "NONE YET" }
            ].map(({ label, value }, i) => (
              <div
                key={label}
                className={`flex items-center justify-between gap-3 py-2.5 ${
                  i < 3 ? "border-b border-command-line/50" : ""
                }`}
              >
                <span className="text-command-steel">{label}</span>
                <span className="text-right font-medium text-command-text">{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/simulator"
              className="btn-glow inline-flex items-center gap-2 border border-cyan-400/40 bg-cyan-400/[0.1] px-4 py-2 text-sm font-semibold text-cyan-100 transition-all duration-200 hover:bg-cyan-400/[0.18] hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(0,212,255,0.25)]"
            >
              <Icon name="play" className="h-3.5 w-3.5" />
              Open launchpad
            </Link>
            {latestRun ? (
              <Link
                href={`/simulator/${latestRun.id}`}
                className="btn-glow inline-flex items-center gap-2 border border-command-line bg-white/[0.03] px-4 py-2 text-sm font-semibold text-command-text transition-all duration-200 hover:border-cyan-400/30 hover:bg-white/[0.06]"
              >
                <Icon name="arrow" className="h-3.5 w-3.5" />
                Resume latest
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function RoadmapPanel() {
  const phaseColors = ["cyan", "violet", "amber", "emerald"] as const;

  return (
    <Panel
      title="AI Adoption Roadmap"
      icon="roadmap"
      kicker="Execution path from prototype to governed operational layer"
      action={<StatusChip status="review" compact />}
      accent="violet"
    >
      <div className="space-y-2.5">
        {roadmap.map((step, i) => {
          const color = phaseColors[i % phaseColors.length];
          const borderClass =
            color === "cyan"
              ? "border-l-cyan-400/60"
              : color === "violet"
              ? "border-l-violet-400/60"
              : color === "amber"
              ? "border-l-amber-400/60"
              : "border-l-emerald-400/60";
          const textClass =
            color === "cyan"
              ? "text-cyan-300"
              : color === "violet"
              ? "text-violet-300"
              : color === "amber"
              ? "text-amber-300"
              : "text-emerald-300";

          return (
            <div
              key={step.phase}
              className={`grid gap-3 border border-command-line/70 border-l-2 bg-black/20 p-4 transition-all duration-200 hover:bg-black/30 hover:border-command-line md:grid-cols-[110px_1fr] ${borderClass}`}
            >
              <div>
                <p className={`font-mono text-xs font-semibold ${textClass}`}>{step.phase}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-command-muted">
                  {step.horizon}
                </p>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">{step.title}</h3>
                  <StatusChip status={step.status} compact />
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-400">{step.detail}</p>
                <p className="mt-1.5 text-[10px] text-command-muted">
                  Evidence: <span className="text-command-steel">{step.proof}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function RecentRunPanel({ latestRun }: { latestRun: RunSummary | null }) {
  return (
    <Panel
      title="Simulator Status"
      icon="play"
      kicker="Current v1 target"
      action={<StatusChip status="ready" compact />}
      accent="emerald"
    >
      <div className="space-y-3">
        <div className="relative overflow-hidden border border-command-line/70 bg-black/20 p-4">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-emerald-400/30 to-transparent" />
          <p className="text-sm font-semibold text-white">Working definition</p>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            A user can create a twin run from multiple scenario families, progress through the
            workflow, replay subsystem state, review a recommendation, generate an evidence packet,
            refresh, and resume the same state.
          </p>
        </div>
        <div className="border border-command-line/70 bg-black/20 p-4">
          <p className="text-sm font-semibold text-white">Recent activity</p>
          {latestRun ? (
            <>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                Latest run{" "}
                <span className="font-mono text-cyan-300">{latestRun.lotId}</span> is saved at
                step <span className="font-mono text-cyan-300">{latestRun.currentStep}</span>.
              </p>
              <Link
                href={`/simulator/${latestRun.id}`}
                className="btn-glow mt-3 inline-flex items-center gap-2 border border-command-line bg-white/[0.03] px-3 py-2 text-xs font-semibold text-white transition-all duration-200 hover:border-cyan-400/30"
              >
                <Icon name="arrow" className="h-3.5 w-3.5 text-cyan-400" />
                Resume run
              </Link>
            </>
          ) : (
            <p className="mt-2 text-xs leading-5 text-slate-400">
              No saved runs yet. Use the launchpad to create the first deterministic incident.
            </p>
          )}
        </div>
      </div>
    </Panel>
  );
}

function VendorPanel() {
  return (
    <Panel
      title="Vendor and Architecture Comparison"
      icon="stack"
      kicker="Standards-first industrial stack versus narrow tool adoption"
      action={<StatusChip status="review" compact />}
      accent="amber"
    >
      <div className="space-y-2.5">
        {vendorLayers.map((layer) => (
          <article key={layer.layer} className="border border-command-line/70 bg-black/20 p-4 transition-all duration-200 hover:border-command-line">
            <h3 className="text-sm font-semibold text-white">{layer.layer}</h3>
            <div className="mt-3 grid gap-2.5 md:grid-cols-2">
              <ComparisonBlock label="Standards-first" text={layer.standardsFirst} good />
              <ComparisonBlock label="Lock-in risk" text={layer.vendorLocked} />
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-400">{layer.recommendation}</p>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function GovernancePanel() {
  return (
    <Panel
      title="Risk and Governance"
      icon="shield"
      kicker="Safety and compliance constraints for the simulator"
      action={<StatusChip status="locked" compact />}
    >
      <div className="space-y-2.5">
        {governanceItems.map((item) => (
          <article
            key={item.title}
            className="border border-command-line/70 bg-black/20 p-4 transition-all duration-200 hover:border-command-line"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-white">{item.title}</p>
              <StatusChip status={item.status} compact />
            </div>
            <p className="mt-2 text-xs text-command-muted">{item.control}</p>
            <p className="mt-2 text-[10px] leading-4 text-slate-400">
              Evidence: <span className="text-command-steel">{item.evidence}</span>
            </p>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function OverviewRail({ latestRun }: { latestRun: RunSummary | null }) {
  return (
    <div className="glass-panel relative flex h-full flex-col overflow-hidden">
      {/* Right accent bar */}
      <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-violet-400/25 to-transparent" />

      <div className="border-b border-command-line/60 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-violet-400/60">
          Command Intelligence
        </p>
        <h2 className="mt-2 text-lg font-semibold text-white">Executive Signal Rail</h2>
        <p className="mt-1.5 text-xs leading-5 text-slate-400">
          Launch the first real simulator loop, then harden the same boundary for future persistence.
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {/* Current focus card */}
        <div className="relative overflow-hidden border border-violet-400/20 bg-violet-400/[0.04] p-4">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-violet-400/50 to-transparent" />
          <p className="text-[10px] uppercase tracking-[0.2em] text-command-muted">Current Focus</p>
          <div className="mt-2.5 flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center border border-violet-400/30 bg-violet-400/[0.1]">
              <Icon name="flow" className="h-4 w-4 text-violet-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Cyber-Physical Twin Lab</p>
              <p className="text-[10px] text-command-muted">Multi-scenario persisted workflow</p>
            </div>
          </div>
        </div>

        {/* KPI dashboard */}
        <section>
          <div className="mb-2.5 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-white">KPI Dashboard</h3>
            <Icon name="chart" className="h-4 w-4 text-cyan-400/60" />
          </div>
          <div className="space-y-2">
            {overviewKpis.map((kpi) => (
              <article
                key={kpi.label}
                className="group relative overflow-hidden border border-command-line/70 bg-black/20 p-3 transition-all duration-200 hover:border-command-line"
              >
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-cyan-400/0 via-cyan-400/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-white">{kpi.label}</p>
                  <StatusChip status={kpi.status} compact />
                </div>
                <div className="mt-2.5 flex items-end justify-between gap-3">
                  <p className="kpi-value text-2xl font-semibold text-white">{kpi.value}</p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-cyan-300">
                    {kpi.delta}
                  </p>
                </div>
                <p className="mt-1.5 text-[10px] leading-4 text-command-muted">{kpi.detail}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Latest run */}
        <section className="relative overflow-hidden border border-command-line/70 bg-black/20 p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-white">Latest saved run</h3>
            <StatusChip status={latestRun ? "ready" : "locked"} compact />
          </div>
          <p className="mt-2.5 text-xs leading-5 text-slate-400">
            {latestRun
              ? `${latestRun.lotId} on ${latestRun.lineId} is saved at step ${latestRun.currentStep}.`
              : "No simulator runs are stored yet in local persistence."}
          </p>
        </section>
      </div>
    </div>
  );
}
