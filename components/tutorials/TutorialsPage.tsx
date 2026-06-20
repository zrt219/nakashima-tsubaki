"use client";

import { useEffect, useMemo, useState } from "react";
import { Panel } from "@/components/tn-command-center/command-center-primitives";
import { TutorialCard, TutorialDefinition } from "@/components/tutorials/TutorialCard";
import { TutorialChecklist } from "@/components/tutorials/TutorialChecklist";
import { TutorialProgress } from "@/components/tutorials/TutorialProgress";

const STORAGE_KEY = "tn-tutorial-progress-v2";

const TUTORIALS: TutorialDefinition[] = [
  {
    id: "what-is-nakashima",
    title: "MISSION: COGNITIVE UPLINK",
    accent: "indigo",
    missionBrief: "Welcome to the simulation-first command center. Your first objective is to understand the AI's boundaries.",
    tacticalSpecs: "Demonstrates advisory AI, digital twin telemetry, and hash-based provenance without physical machine control.",
    tryNowLabel: "Enter Cognition Center",
    tryNowHref: "/cognitive",
    steps: [
      {
        title: "Initialize Observer Mode",
        missionBrief: "Calibrate your HUD. You are observing deterministic simulations, not live hardware.",
        tacticalSpecs: "Observe the dashboard shells. Operations are bounded strictly to the simulation and persistence layers.",
      },
      {
        title: "Observe Telemetry Ghosting",
        missionBrief: "Watch how physical conditions are mirrored without exposing the actual factory floor to cyber threats.",
        tacticalSpecs: "Signals stay within the WebGL twin layer; no write-authority edge agents are executed.",
      },
    ],
  },
  {
    id: "what-is-iot-maker",
    title: "MISSION: IOT MAKER ONBOARDING",
    accent: "amber",
    missionBrief: "Learn how to seed anomalies and safely dispatch command recommendations.",
    tacticalSpecs: "Use `/iot-maker` to validate AWS IoT / STS services and inspect Supabase event persistence.",
    tryNowLabel: "Initialize IoT Maker",
    tryNowHref: "/iot-maker",
    steps: [
      {
        title: "Configure the Matrix",
        missionBrief: "Ensure all external integrations (AWS, Supabase, Ledgers) are green-lit before proceeding.",
        tacticalSpecs: "Validates `NEXT_PUBLIC_PROOF_MODE` and loads respective client adapters.",
      },
      {
        title: "Run Command Flow Simulation",
        missionBrief: "Inject a payload, review the AI advisory, and authorize the shadow execution.",
        tacticalSpecs: "Dispatch remains simulated in 'demo' mode. Generates an evidence hash upon completion.",
      },
    ],
  },
  {
    id: "supabase-fit",
    title: "MISSION: PERSISTENCE LAYER",
    accent: "emerald",
    missionBrief: "Dive into the raw event ledger to see how actions are recorded.",
    tacticalSpecs: "Utilizes Next.js Server Actions with Supabase Postgres for immutable event append logs.",
    tryNowLabel: "Access Database Logs",
    tryNowHref: "/iot-maker",
    steps: [
      {
        title: "Query Safe Presets",
        missionBrief: "Pull down the latest telemetry and active scenarios directly from the core.",
        tacticalSpecs: "REST endpoints abstract unsafe raw SQL. Requires Row-Level Security (RLS) configured.",
      },
      {
        title: "Verify Audit Trail",
        missionBrief: "Check the ledger. Every anomaly and operator action leaves a fingerprint.",
        tacticalSpecs: "Queries `proof.anchors` to surface post-incident provenance trails.",
      },
    ],
  },
  {
    id: "blockchain-fit",
    title: "MISSION: BLOCKCHAIN AUDIT TRACE",
    accent: "rose",
    missionBrief: "Follow an evidence hash from the local ledger directly to the public testnets.",
    tacticalSpecs: "Uses XRPL AccountSet Memos and Hedera EVM Smart Contracts to anchor deterministic SHA-256 hashes.",
    tryNowLabel: "Inspect Proof Ledger",
    tryNowHref: "/iot-maker",
    steps: [
      {
        title: "Cryptographic Sealing",
        missionBrief: "Understand that we do not broadcast live data. We only broadcast the mathematical proof.",
        tacticalSpecs: "Canonicalizes telemetry via deterministic JSON sorting before generating a SHA-256 digest.",
      },
      {
        title: "Verify On-Chain",
        missionBrief: "Follow the transaction link and verify the exact hash exists in a public, immutable block.",
        tacticalSpecs: "Parses EVM events and XRPL memos to reconstruct the anchor verification externally.",
      },
    ],
  },
  {
    id: "recursive-memory",
    title: "MISSION: RECURSIVE EDGE MEMORY",
    accent: "fuchsia",
    missionBrief: "Demonstrate Double Edge Automations where the AI learns from past runs and alters its recommendations.",
    tacticalSpecs: "Triggers scenario-22. First run generates a reflex memory. Second run queries the persistent memory loop to override standard baseline logic.",
    tryNowLabel: "Run Digital Twin",
    tryNowHref: "/simulator",
    steps: [
      {
        title: "Seed Initial Anomaly",
        missionBrief: "Inject progressive high-frequency chatter into the twin.",
        tacticalSpecs: "The system attempts a baseline feed reduction. Operator approval seals this action into the 'Reflex Memory' index.",
      },
      {
        title: "Trigger Recursion Loop",
        missionBrief: "Seed the exact same anomaly a second time to witness learning.",
        tacticalSpecs: "The advisory engine intercepts the memory of the failed feed reduction and preemptively halts the spindle instead.",
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
    <section className="space-y-4 pb-20">
      <Panel title="Command Center Missions" kicker="Tactical Operations" icon="flow" accent="cyan">
        <p className="text-sm text-slate-200">
          Welcome to the TN Precision AI Command Center. These missions will calibrate your understanding of the deterministic digital twin and the multi-chain evidence layer.
        </p>
        <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-cyan-400">
          STATUS: SIMULATION MODE ACTIVE. ALL PHYSICAL CONTROLS ARE ISOLATED.
        </p>
      </Panel>

      <TutorialProgress total={TUTORIALS.length} completed={progress} onReset={resetProgress} />

      <div className="grid gap-4 lg:grid-cols-2">
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
