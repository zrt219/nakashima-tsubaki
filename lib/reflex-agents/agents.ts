import type { ReflexAgentRole } from "@/lib/reflex-agents/types";

export type ReflexAgentProfile = {
  role: ReflexAgentRole;
  name: string;
  purpose: string;
  boundary: string;
  allowAction: boolean;
};

export const REFLEX_AGENTS: ReflexAgentProfile[] = [
  {
    role: "atlas",
    name: "Atlas",
    purpose: "Observes telemetry and classifies first-order operational anomalies.",
    boundary: "Reads evidence signals only and proposes candidate investigation directions.",
    allowAction: false,
  },
  {
    role: "scribe",
    name: "Scribe",
    purpose: "Retrieves logs, approvals, prior runs, and evidence anchors.",
    boundary: "Reads from RAG/persistence snapshots only; no command authority.",
    allowAction: false,
  },
  {
    role: "forge",
    name: "Forge",
    purpose: "Simulates safe tool execution and prepares dispatch payloads.",
    boundary: "Can draft tool calls but cannot execute machine write operations.",
    allowAction: true,
  },
  {
    role: "sentinel",
    name: "Sentinel",
    purpose: "Runs safety and policy checks before any execution path.",
    boundary: "Hard-blocks unsafe control actions and secret-handling violations.",
    allowAction: false,
  },
  {
    role: "operator",
    name: "Operator",
    purpose: "Provides explicit human approval/rejection for action proposals.",
    boundary: "Final approval gate for every operational proposal.",
    allowAction: true,
  },
] as const;

export function getReflexAgent(role: ReflexAgentRole): ReflexAgentProfile {
  return REFLEX_AGENTS.find((agent) => agent.role === role) ??
    REFLEX_AGENTS.find((agent) => agent.role === "atlas")!;
}
