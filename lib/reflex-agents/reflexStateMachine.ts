import type { ReflexPhase } from "@/lib/reflex-agents/types";

export const REFLEX_PHASE_SEQUENCE: ReflexPhase[] = [
  "idle",
  "observing",
  "diagnosing",
  "planning",
  "selecting_tools",
  "simulating",
  "evaluating",
  "approval_required",
  "approved",
  "rejected",
  "dispatching",
  "capturing_evidence",
  "anchoring_proof",
  "reflecting",
  "proposing_improvement",
  "memory_update_ready",
  "complete",
];

const phaseToIndex = new Map<ReflexPhase, number>(REFLEX_PHASE_SEQUENCE.map((value, idx) => [value, idx]));

export type ReflexTransition = {
  from: ReflexPhase;
  to: ReflexPhase;
  reason: string;
  blocking?: boolean;
};

export function getNextReflexPhase(current: ReflexPhase, transition?: Partial<ReflexTransition>): ReflexPhase {
  const currentIndex = phaseToIndex.get(current) ?? 0;
  if (transition?.to && REFLEX_PHASE_SEQUENCE.includes(transition.to)) {
    return transition.to;
  }
  const nextIndex = Math.min(currentIndex + 1, REFLEX_PHASE_SEQUENCE.length - 1);
  return REFLEX_PHASE_SEQUENCE[nextIndex];
}

export function isTerminalPhase(phase: ReflexPhase): boolean {
  return phase === "complete" || phase === "rejected";
}

export function normalizeReflexPhase(value: string): ReflexPhase {
  return REFLEX_PHASE_SEQUENCE.includes(value as ReflexPhase) ? (value as ReflexPhase) : "idle";
}

export function makePhaseLabel(phase: ReflexPhase): string {
  return phase
    .split("_")
    .map((section) => section[0]!.toUpperCase() + section.slice(1))
    .join(" ");
}

