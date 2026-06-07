import type { ReflexPhase } from "@/lib/reflex-agents/types";

export type ReflexTimelineStep = {
  phase: ReflexPhase;
  label: string;
  startAtMs: number;
  endAtMs: number;
  icon?: "orbit" | "tool" | "shield" | "approval" | "proof" | "memory" | "target";
  risk: "low" | "medium" | "high";
};

export const REFLEX_TIMELINE_SEQUENCE: ReflexTimelineStep[] = [
  {
    phase: "observing",
    label: "Telemetry spike detected",
    startAtMs: 0,
    endAtMs: 400,
    icon: "orbit",
    risk: "low",
  },
  {
    phase: "diagnosing",
    label: "Atlas diagnoses anomaly",
    startAtMs: 400,
    endAtMs: 800,
    icon: "target",
    risk: "low",
  },
  {
    phase: "planning",
    label: "Reflex planning",
    startAtMs: 800,
    endAtMs: 1100,
    icon: "target",
    risk: "low",
  },
  {
    phase: "selecting_tools",
    label: "Scribe retrieves prior evidence",
    startAtMs: 1100,
    endAtMs: 1400,
    icon: "tool",
    risk: "low",
  },
  {
    phase: "simulating",
    label: "Forge drafts structured action proposal",
    startAtMs: 1400,
    endAtMs: 1800,
    icon: "tool",
    risk: "medium",
  },
  {
    phase: "evaluating",
    label: "Sentinel flags approval requirement",
    startAtMs: 1800,
    endAtMs: 2200,
    icon: "shield",
    risk: "high",
  },
  {
    phase: "approval_required",
    label: "Operator Gate pauses execution",
    startAtMs: 2200,
    endAtMs: 2500,
    icon: "approval",
    risk: "medium",
  },
  {
    phase: "approved",
    label: "Approval simulated in Demo Mode",
    startAtMs: 2500,
    endAtMs: 3000,
    icon: "approval",
    risk: "low",
  },
  {
    phase: "dispatching",
    label: "Shadow IoT dispatch simulated",
    startAtMs: 3000,
    endAtMs: 3500,
    icon: "tool",
    risk: "medium",
  },
  {
    phase: "capturing_evidence",
    label: "Evidence packet generated",
    startAtMs: 3500,
    endAtMs: 4000,
    icon: "proof",
    risk: "low",
  },
  {
    phase: "anchoring_proof",
    label: "Proof hash anchored in Mock Proof Ledger",
    startAtMs: 4000,
    endAtMs: 4500,
    icon: "proof",
    risk: "low",
  },
  {
    phase: "reflecting",
    label: "Reflex Loop evaluates outcome",
    startAtMs: 4500,
    endAtMs: 4700,
    icon: "shield",
    risk: "medium",
  },
  {
    phase: "proposing_improvement",
    label: "Improvement proposal generated",
    startAtMs: 4700,
    endAtMs: 4900,
    icon: "memory",
    risk: "low",
  },
  {
    phase: "memory_update_ready",
    label: "Verified memory staged",
    startAtMs: 4900,
    endAtMs: 5000,
    icon: "memory",
    risk: "low",
  },
];

export const REFLEX_TIMELINE_LOOKUP = new Map<ReflexPhase, ReflexTimelineStep>(
  REFLEX_TIMELINE_SEQUENCE.map((step) => [step.phase, step]),
);

