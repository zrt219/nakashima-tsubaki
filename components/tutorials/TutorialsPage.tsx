"use client";

import { useEffect, useMemo, useState } from "react";
import { Panel } from "@/components/tn-command-center/command-center-primitives";
import { TutorialCard, TutorialDefinition } from "@/components/tutorials/TutorialCard";
import { TutorialChecklist } from "@/components/tutorials/TutorialChecklist";
import { TutorialProgress } from "@/components/tutorials/TutorialProgress";

const STORAGE_KEY = "tn-tutorial-progress-v1";

const TUTORIALS: TutorialDefinition[] = [
  {
    id: "what-is-nakashima",
    title: "What is Tsubaki-Nakashima AI?",
    beginner: "A quick guided introduction to the simulation-first command center and what it models.",
    technical:
      "This stack demonstrates advisory AI, digital twin telemetry, approval gating, and hash-based provenance without direct machine control.",
    tryNowLabel: "Open Cognition Center",
    tryNowHref: "/cognitive",
    steps: [
      {
        title: "Core objective",
        beginner: "Understand that this is a portfolio prototype for advisory-first industrial AI.",
        technical: "Observe the dashboard shells and event stream as a deterministic operator interface.",
      },
      {
        title: "Telemetry and twin map",
        beginner: "Look at simulated twin scenarios and why physical control is outside this app's scope.",
        technical: "Signals stay in simulator and persistence layers; no write authority exists in browser.",
      },
    ],
  },
  {
    id: "what-is-iot-maker",
    title: "What is IoT Maker?",
    beginner: "Learn the commissioning map for demos, readiness checks, and safe command flow.",
    technical:
      "Use `/iot-maker` to validate required services, run command flow tests, and inspect proof anchoring status.",
    tryNowLabel: "Open IoT Maker",
    tryNowHref: "/iot-maker",
    steps: [
      {
        title: "Demo vs connected",
        beginner: "Run in mock mode first, then connect optional cloud services when env vars are present.",
        technical: "Connected mode requires readiness checks for keys and broker configuration.",
      },
      {
        title: "Command flow test",
        beginner: "Execute the same anomaly-to-proof workflow with explicit approval simulation.",
        technical: "Dispatch never occurs in demo mode unless operator approval is simulated.",
      },
    ],
  },
  {
    id: "command-flow",
    title: "How does the command flow work?",
    beginner: "Follow how telemetry, recommendation, approval, and dispatch simulation connect together.",
    technical: "A deterministic workflow logs each phase into safe event and proof artifacts.",
    tryNowLabel: "Run Command Test",
    tryNowHref: "/iot-maker",
    steps: [
      {
        title: "Telemetry generation",
        beginner: "Synthetic sensor readings are generated with bounded anomaly scenarios.",
        technical: "Telemetry schema is validated before recommendation proposals.",
      },
      {
        title: "AI proposal and approval",
        beginner: "A recommendation is proposed and held pending operator action.",
        technical: "Safety checks and operator-gate rules are enforced before dispatch simulation.",
      },
    ],
  },
  {
    id: "supabase-fit",
    title: "How does Supabase fit in?",
    beginner: "Understand the safe persistence model for events, scenarios, and proof records.",
    technical: "Supabase is used with server-side queries and public-safe read patterns in this prototype.",
    tryNowLabel: "Open Query Lab",
    tryNowHref: "/iot-maker",
    steps: [
      {
        title: "Query presets",
        beginner: "Use safe preset queries for quick visibility.",
        technical: "Preset routes prevent unsafe SQL and avoid destructive commands.",
      },
      {
        title: "Mode visibility",
        beginner: "Demo mode returns mock rows when env is not configured.",
        technical: "Connected mode attempts real read-only Supabase table queries under server key guardrails.",
      },
    ],
  },
  {
    id: "gemini-fit",
    title: "How does Gemini fit in?",
    beginner: "Learn how AI prompts are tested without allowing live machine control.",
    technical: "Structured outputs and tool proposals are inspected and logged; operator action is always separate.",
    tryNowLabel: "Open Gemini Test",
    tryNowHref: "/iot-maker",
    steps: [
      {
        title: "Presets and responses",
        beginner: "Use summary and recommendation prompts to observe advisory-only behavior.",
        technical: "Proposed tool payloads are logged and must pass operator-gate checks.",
      },
      {
        title: "Safety path",
        beginner: "See how approval and control are blocked from model output.",
        technical: "No secrets are logged and no control APIs are executed directly from tool output.",
      },
    ],
  },
  {
    id: "blockchain-fit",
    title: "How does blockchain fit in?",
    beginner: "Understand what goes on-chain versus what stays server-side.",
    technical: "Only evidence hashes are anchored, never raw telemetry or commands.",
    tryNowLabel: "Open Proof Ledger",
    tryNowHref: "/iot-maker",
    steps: [
      {
        title: "Hash-only anchoring",
        beginner: "Proof records lock an evidence identity, not operational payloads.",
        technical: "XRPL and Hedera paths stay proof-only and maintain approval/dispatched separation.",
      },
      {
        title: "Verification surface",
        beginner: "Review proof status and verifier output in the IoT Maker proof tab.",
        technical: "Use mock mode by default; connected chains require explicit mode/env configuration.",
      },
    ],
  },
  {
    id: "safety-model",
    title: "Safety model",
    beginner: "Learn the command authority model from proposal through audit.",
    technical: "AI can recommend, operator approves, edge bridge dispatches approved commands, and logs remain immutable.",
    tryNowLabel: "Open Safety Ledger",
    tryNowHref: "/iot-maker",
    steps: [
      {
        title: "Authority boundary",
        beginner: "No direct PLC or actuator call can occur from model output.",
        technical: "Operator gate and approval matrix enforce manual intervention and policy checks.",
      },
      {
        title: "Audit trace",
        beginner: "Every flow writes a trace in event ledgers and logs.",
        technical: "Proof integrity and safety checks reduce unsafe dispatch and hidden control paths.",
      },
    ],
  },
];

function readFromStorage(): string[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value) => typeof value === "string");
  } catch {
    return [];
  }
}

function saveToStorage(values: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
}

export function TutorialsPage() {
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => new Set(readFromStorage()));

  useEffect(() => {
    saveToStorage(Array.from(completedIds));
  }, [completedIds]);

  const progress = useMemo(() => {
    return TUTORIALS.reduce((total, tutorial) => (completedIds.has(tutorial.id) ? total + 1 : total), 0);
  }, [completedIds]);

  const toggleCompletion = (tutorialId: string, completed: boolean) => {
    setCompletedIds((state) => {
      const next = new Set(state);
      if (completed) {
        next.add(tutorialId);
      } else {
        next.delete(tutorialId);
      }
      return next;
    });
  };

  const resetProgress = () => setCompletedIds(new Set());

  return (
    <section className="space-y-4">
      <Panel title="Beginner Tutorials" kicker="How the command center works" icon="flow" accent="violet">
        <p className="text-sm text-slate-200">
          These walkthroughs explain the stack in plain terms, then connect each idea to the same safe
          production-minded interfaces used in this app.
        </p>
        <p className="mt-2 text-xs text-command-muted">
          This is an independent demo prototype. It does not control live production machinery.
        </p>
      </Panel>

      <TutorialProgress total={TUTORIALS.length} completed={progress} onReset={resetProgress} />

      <div className="grid gap-3 lg:grid-cols-2">
        {TUTORIALS.map((tutorial) => (
          <TutorialCard
            key={tutorial.id}
            tutorial={tutorial}
            isCompleted={completedIds.has(tutorial.id)}
            onToggleComplete={toggleCompletion}
          />
        ))}
      </div>

      <TutorialChecklist
        items={TUTORIALS.map((tutorial) => ({ id: tutorial.id, title: tutorial.title }))}
        completed={completedIds}
      />
    </section>
  );
}
