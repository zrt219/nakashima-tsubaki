"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  assessScenarioRisk,
  buildDefaultQuery,
  buildRecommendation,
  getScenarioTemplateProfile,
  searchKnowledgeDocuments
} from "@/lib/simulator/engine";
import { getSimulatorPersistenceLabel } from "@/lib/simulator/persistence";
import { buildScenarioInputPreset, defaultScenarioInput, scenarioTemplates } from "@/lib/simulator/seed-data";
import { motion } from "framer-motion";
import { createSimulatorRun, useSimulatorRunSummaries } from "@/lib/simulator/use-simulator-store";
import { tutorialStore } from "@/lib/simulator/tutorial-store";
import type { RunSummary, ScenarioInput } from "@/lib/simulator/types";
import { CommandCenterShell, ShellActionLink } from "@/components/tn-command-center/command-center-shell";
import { Icon, Panel, StatusChip } from "@/components/tn-command-center/command-center-primitives";

export function SimulatorLaunchpad() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<ScenarioInput>(defaultScenarioInput);
  const { recentRuns } = useSimulatorRunSummaries();
  const activeTemplate = getScenarioTemplateProfile(form);

  const previewRisk = assessScenarioRisk(form);
  const previewRecommendation = buildRecommendation(form, previewRisk);
  const previewQuery = buildDefaultQuery(form);
  const previewDocs = searchKnowledgeDocuments(previewQuery, form);

  const isCritical = previewRisk.riskLevel === "critical";

  function updateField<Key extends keyof ScenarioInput>(key: Key, value: ScenarioInput[Key]) {
    setForm((currentForm) => ({
      ...currentForm,
      [key]: value
    }));
  }

  function handleTemplateSelect(templateId: NonNullable<ScenarioInput["scenarioTemplateId"]>) {
    setForm(buildScenarioInputPreset(templateId));
  }

  function handleCreateRun() {
    startTransition(() => {
      void createSimulatorRun(form).then((run) => {
        router.push(`/simulator/${run.id}`);
      });
    });
  }

  return (
    <CommandCenterShell
      activeAreaId="twins"
      eventStream={[
        {
          timestamp: "08:14",
          source: "Launchpad",
          event: "Scenario inputs ready",
          payload: `${activeTemplate.title} configured for ${form.lineId}`,
          status: "simulated"
        },
        {
          timestamp: "08:19",
          source: "Risk Engine",
          event: "Preview risk assessed",
          payload: `${previewRisk.riskLevel.toUpperCase()} risk with score ${previewRisk.score}`,
          status: isCritical ? "review" : "simulated"
        },
        {
          timestamp: "08:27",
          source: "Corpus",
          event: "Knowledge preview loaded",
          payload: `${previewDocs.length} approved documents ranked for launch`,
          status: "ready"
        },
        {
          timestamp: "08:35",
          source: "Persistence",
          event: "Local run creation armed",
          payload: getSimulatorPersistenceLabel(),
          status: "approval"
        }
      ]}
      utilityActions={
        <>
          <ShellActionLink href="/" label="Executive overview" tone="secondary" />
        </>
      }
      rightRail={
        <LaunchpadRail recentRuns={recentRuns} activeTemplateTitle={activeTemplate.title} />
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
        <motion.div id="tutorial-welcome" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.4 } } }} className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">Mission Launchpad</h2>
            <p className="mt-1 text-sm text-slate-300">
              Configure and instantiate a new digital twin scenario in isolated testnet bounds.
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
          className="mt-6 flex flex-1 flex-col gap-6 xl:flex-row"
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

                <div
                  className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full opacity-40"
                  style={{
                    background: "radial-gradient(circle, rgba(0,229,160,0.12) 0%, transparent 70%)",
                    filter: "blur(24px)"
                  }}
                  aria-hidden="true"
                />

                <div className="grid gap-4 p-5 2xl:grid-cols-[minmax(0,1fr)_340px] xl:p-7">
                  <div className="min-w-0">
                    <div className="mb-5 flex flex-wrap items-center gap-2">
                      <StatusChip status="simulated" />
                      <StatusChip status="approval" />
                    </div>
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

                  <div
                    key={activeTemplate.id + form.cpk + form.temperatureBand}
                    className="relative overflow-hidden border border-command-line/80 bg-black/30 p-5 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-md animate-[fadeIn_0.5s_ease-out]"
                  >
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-emerald-400/80 shadow-[0_0_8px_rgba(16,185,129,0.8)] opacity-0 animate-[scan_3s_ease-in-out_infinite]" />
                    <span className="absolute top-0 left-0 h-2 w-2 border-t border-l border-emerald-400/50" />
                    <span className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-emerald-400/50" />

                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-command-muted">
                      Preview
                    </p>
                    <div className="mt-4 space-y-0 font-mono text-xs">
                      {[
                        { label: "Scenario", value: activeTemplate.title.toUpperCase() },
                        {
                          label: "Risk level",
                          value: previewRisk.riskLevel.toUpperCase(),
                          highlight: isCritical
                        },
                        {
                          label: "Disposition",
                          value: previewRecommendation.lotDisposition.replaceAll("_", " ").toUpperCase()
                        },
                        { label: "Operator role", value: activeTemplate.operatorRole.toUpperCase() }
                      ].map(({ label, value, highlight }, i, arr) => (
                        <div
                          key={label}
                          className={`flex items-center justify-between gap-3 py-2.5 ${
                            i < arr.length - 1 ? "border-b border-command-line/50" : ""
                          }`}
                        >
                          <span className="text-command-steel">{label}</span>
                          <span
                            className={`text-right font-medium ${
                              highlight ? "text-amber-300" : "text-command-text"
                            }`}
                          >
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.82fr)]">
                <Panel
                  title="Scenario Setup"
                  icon="flow"
                  kicker="Deterministic multi-scenario cyber-physical incident input"
                  action={<StatusChip status="ready" compact />}
                  accent="cyan"
                >
                  <div className="mb-6 grid gap-3 xl:grid-cols-3">
                    {scenarioTemplates.map((template) => {
                      const active = template.id === activeTemplate.id;

                      return (
                        <button
                          key={template.id}
                          type="button"
                          id={`template-${template.id}`}
                          onClick={() => handleTemplateSelect(template.id)}
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
                              <p className="text-sm font-semibold text-white">{template.title}</p>
                              <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-command-muted">
                                {template.focusArea}
                              </p>
                            </div>
                            <StatusChip status={active ? "ready" : "simulated"} compact />
                          </div>
                          <p className="mt-3 text-xs leading-5 text-slate-400">{template.detail}</p>
                          <p className="mt-2.5 text-[10px] text-command-muted">
                            Boundary: <span className="text-command-steel">{template.controlBoundary}</span>
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  <div id="tutorial-step-seed" className="grid gap-3.5 md:grid-cols-2">
                    <FormField
                      label="Facility ID"
                      value={form.facilityId ?? ""}
                      onChange={(v) => updateField("facilityId", v.toUpperCase())}
                    />
                    <FormField
                      label="Lot ID"
                      value={form.lotId}
                      onChange={(v) => updateField("lotId", v.toUpperCase())}
                    />
                    <FormField
                      label="Line ID"
                      value={form.lineId}
                      onChange={(v) => updateField("lineId", v.toUpperCase())}
                    />
                    <FormField
                      label="Machine ID"
                      value={form.machineId ?? ""}
                      onChange={(v) => updateField("machineId", v.toUpperCase())}
                    />
                    <SelectField
                      label="Vibration band"
                      value={form.vibrationBand}
                      onChange={(value) => updateField("vibrationBand", value as ScenarioInput["vibrationBand"])}
                      options={[
                        { value: "nominal", label: "Nominal" },
                        { value: "elevated", label: "Elevated" },
                        { value: "critical", label: "Critical" }
                      ]}
                    />
                    <SelectField
                      label="Temperature band"
                      value={form.temperatureBand}
                      onChange={(value) => updateField("temperatureBand", value as ScenarioInput["temperatureBand"])}
                      options={[
                        { value: "nominal", label: "Nominal" },
                        { value: "elevated", label: "Elevated" },
                        { value: "critical", label: "Critical" }
                      ]}
                    />
                    <label className="group block relative">
                      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-400/60 transition-colors duration-200 group-focus-within:text-cyan-300">
                        Cpk replay
                      </span>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          min="0.8"
                          max="2.0"
                          value={form.cpk}
                          onChange={(event) => updateField("cpk", Number(event.target.value))}
                          className="relative z-10 w-full border border-command-line/70 bg-black/40 px-3 py-2 font-mono text-sm text-white shadow-inner transition-all duration-200 focus:border-cyan-400/60 focus:bg-cyan-900/10 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 hover:border-cyan-400/30"
                        />
                        <div className="absolute inset-0 z-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/0 to-transparent opacity-0 transition-opacity duration-300 group-focus-within:via-cyan-400/5 group-focus-within:opacity-100" />
                      </div>
                    </label>
                    <SelectField
                      label="Surface finish"
                      value={form.surfaceFinishStatus}
                      onChange={(value) => updateField("surfaceFinishStatus", value as ScenarioInput["surfaceFinishStatus"])}
                      options={[
                        { value: "nominal", label: "Nominal" },
                        { value: "drift", label: "Drift" },
                        { value: "breach", label: "Breach" }
                      ]}
                    />
                    <SelectField
                      label="Sample expansion"
                      value={form.sampleExpansion}
                      onChange={(value) => updateField("sampleExpansion", value as ScenarioInput["sampleExpansion"])}
                      options={[
                        { value: "not_required", label: "Not required" },
                        { value: "recommended", label: "Recommended" },
                        { value: "required", label: "Required" }
                      ]}
                    />
                    <SelectField
                      label="Operator shift"
                      value={form.operatorShift}
                      onChange={(value) => updateField("operatorShift", value as ScenarioInput["operatorShift"])}
                      options={[
                        { value: "day", label: "Day" },
                        { value: "swing", label: "Swing" },
                        { value: "night", label: "Night" }
                      ]}
                    />
                    <SelectField
                      label="Quality priority"
                      value={form.qualityPriority}
                      onChange={(value) => updateField("qualityPriority", value as ScenarioInput["qualityPriority"])}
                      options={[
                        { value: "containment", label: "Containment" },
                        { value: "balanced", label: "Balanced" },
                        { value: "throughput", label: "Throughput" }
                      ]}
                    />
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      id="create-simulator-run"
                      type="button"
                      onClick={handleCreateRun}
                      disabled={isPending}
                      className="btn-glow inline-flex items-center gap-2 border border-cyan-400/40 bg-cyan-400/[0.1] px-5 py-2.5 text-sm font-semibold text-cyan-100 transition-all duration-200 hover:bg-cyan-400/[0.18] hover:border-cyan-400/60 hover:shadow-[0_0_24px_rgba(0,212,255,0.3)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
                    >
                      {isPending ? (
                        <>
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-300" />
                          Creating run...
                        </>
                      ) : (
                        <>
                          <Icon name="play" className="h-3.5 w-3.5" />
                          Create simulator run
                        </>
                      )}
                    </button>
                    <button
                      id="reset-preset"
                      type="button"
                      onClick={() => setForm(buildScenarioInputPreset(activeTemplate.id))}
                      className="btn-glow inline-flex items-center gap-2 border border-command-line bg-white/[0.03] px-5 py-2.5 text-sm font-semibold text-command-text transition-all duration-200 hover:border-cyan-400/30 hover:bg-white/[0.06]"
                    >
                      <Icon name="arrow" className="h-3.5 w-3.5 rotate-180 text-command-muted" />
                      Reset preset
                    </button>
                  </div>
                </Panel>

                <Panel
                  title="Recommendation Preview"
                  icon="rag"
                  kicker="What the selected twin scenario will generate before review"
                  action={<StatusChip status={isCritical ? "review" : "simulated"} compact />}
                  accent={isCritical ? "amber" : "cyan"}
                >
                  <div className="mb-3 relative overflow-hidden border border-command-line/70 bg-black/20 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{activeTemplate.subtitle}</p>
                        <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-command-muted">
                          {activeTemplate.focusArea}
                        </p>
                      </div>
                      <StatusChip status="advisory" compact />
                    </div>
                    <p className="mt-3 text-xs leading-5 text-slate-400">{activeTemplate.controlBoundary}</p>
                  </div>

                  {isCritical && (
                    <div className="mb-3 flex items-center gap-2.5 border border-amber-400/30 bg-amber-400/[0.06] px-4 py-3">
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-amber-400/50 to-transparent" />
                      <span className="relative flex h-2.5 w-2.5 shrink-0">
                        <span className="status-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-400" />
                      </span>
                      <p className="text-xs font-semibold text-amber-200">
                        Critical risk detected — operator review required
                      </p>
                    </div>
                  )}

                  <div
                    key={previewRecommendation.summary}
                    className="mb-3 border border-command-line/70 bg-black/40 p-4 shadow-inner animate-[fadeIn_0.4s_ease-out]"
                  >
                    <p className="text-sm font-semibold text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">{previewRecommendation.summary}</p>
                    <ul className="mt-3 space-y-1.5">
                      {previewRecommendation.actions.map((action) => (
                        <li key={action} className="flex items-start gap-2 text-xs leading-5 text-slate-300">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(0,212,255,0.8)]" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    {previewDocs.map((document) => (
                      <article
                        key={document.id}
                        className="group relative overflow-hidden border border-command-line/70 bg-black/20 p-3 transition-all duration-200 hover:border-command-line"
                      >
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-cyan-400/0 via-cyan-400/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-mono text-[10px] text-command-muted">{document.id}</p>
                            <p className="mt-0.5 text-xs font-semibold text-white">{document.title}</p>
                          </div>
                          <span className="shrink-0 border border-cyan-400/40 bg-cyan-400/[0.08] px-2 py-0.5 font-mono text-[10px] text-cyan-200">
                            {document.confidence}%
                          </span>
                        </div>
                        <p className="mt-1.5 text-[10px] uppercase tracking-[0.14em] text-command-muted">
                          {document.owner} / {document.type}
                        </p>
                        <p className="mt-1.5 text-xs leading-4 text-slate-400">{document.snippet}</p>
                      </article>
                    ))}
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

function FormField({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="group block relative">
      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-400/60 transition-colors duration-200 group-focus-within:text-cyan-300">
        {label}
      </span>
      <div className="relative">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="relative z-10 w-full border border-command-line/70 bg-black/40 px-3 py-2 font-mono text-sm text-white shadow-inner transition-all duration-200 focus:border-cyan-400/60 focus:bg-cyan-900/10 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 hover:border-cyan-400/30"
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/0 to-transparent opacity-0 transition-opacity duration-300 group-focus-within:via-cyan-400/5 group-focus-within:opacity-100" />
      </div>
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="group block relative">
      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-400/60 transition-colors duration-200 group-focus-within:text-cyan-300">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="relative z-10 w-full appearance-none border border-command-line/70 bg-black/40 px-3 py-2 text-sm text-white shadow-inner transition-all duration-200 focus:border-cyan-400/60 focus:bg-cyan-900/10 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 hover:border-command-line/70"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-command-black text-white">
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 z-20 flex items-center px-3 text-cyan-400/60 group-focus-within:text-cyan-300">
          <Icon name="triangle" className="h-2 w-2 rotate-180" />
        </div>
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/0 to-transparent opacity-0 transition-opacity duration-300 group-focus-within:via-cyan-400/5 group-focus-within:opacity-100" />
      </div>
    </label>
  );
}

function LaunchpadRail({
  recentRuns,
  activeTemplateTitle
}: {
  recentRuns: RunSummary[];
  activeTemplateTitle: string;
}) {
  return (
    <div className="glass-panel relative flex h-full flex-col overflow-hidden bg-black/40 backdrop-blur-xl">
      <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-emerald-400/25 to-transparent" />

      <div className="border-b border-command-line/60 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-400/60">
          Launch Control
        </p>
        <h2 className="mt-2 text-lg font-semibold text-white">Scenario Staging Rail</h2>
        <p className="mt-1.5 text-xs leading-5 text-slate-400">
          Stage the incident, verify the risk preview, then create the saved run.
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {/* Persistence mode */}
        <section className="relative overflow-hidden border border-command-line/70 bg-black/20 p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-white">Persistence mode</h3>
            <StatusChip status="simulated" compact />
          </div>
          <p className="mt-2.5 text-xs leading-5 text-slate-400">{getSimulatorPersistenceLabel()}</p>
        </section>

        {/* Active scenario */}
        <section className="relative overflow-hidden border border-emerald-400/20 bg-emerald-400/[0.03] p-4">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-emerald-400/50 to-transparent" />
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-white">Active scenario</h3>
            <StatusChip status="ready" compact />
          </div>
          <p className="mt-2.5 text-sm font-medium text-emerald-200">{activeTemplateTitle}</p>
          <p className="mt-1.5 text-[10px] text-command-muted">
            Three deterministic scenario families available in the twin lab.
          </p>
        </section>

        {/* Run checklist */}
        <section className="border border-command-line/70 bg-black/20 p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-white">Run checklist</h3>
            <Icon name="check" className="h-4 w-4 text-cyan-300" />
          </div>
          <ul className="mt-3 space-y-2">
            {[
              "Create deterministic incident inputs",
              "Confirm advisory-only recommendation",
              "Save the run and enter the workbench"
            ].map((step) => (
              <li key={step} className="flex items-start gap-2 text-xs leading-5 text-slate-400">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-cyan-400/50" />
                {step}
              </li>
            ))}
          </ul>
        </section>

        {/* Recent runs */}
        <section className="border border-command-line/70 bg-black/20 p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-white">Recent runs</h3>
            <StatusChip status={recentRuns.length ? "ready" : "locked"} compact />
          </div>
          <div className="mt-3 space-y-2">
            {recentRuns.length ? (
              recentRuns.map((run) => (
                <Link
                  key={run.id}
                  href={`/simulator/${run.id}`}
                  className="group block border border-command-line/70 bg-black/20 p-3 transition-all duration-200 hover:border-cyan-400/25 hover:bg-black/30"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-white">{run.lotId}</p>
                    <Icon name="arrow" className="h-3.5 w-3.5 text-command-muted transition-colors group-hover:text-cyan-400" />
                  </div>
                  <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-command-muted">
                    {run.scenarioName} / {run.currentStep}
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-xs leading-5 text-slate-400">No saved runs yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
