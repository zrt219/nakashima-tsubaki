"use client";

import Link from "next/link";
import { Panel } from "@/components/tn-command-center/command-center-primitives";
import { TutorialStep } from "@/components/tutorials/TutorialStep";

export type TutorialDefinition = {
  id: string;
  title: string;
  beginner: string;
  technical: string;
  tryNowHref: string;
  tryNowLabel: string;
  steps: Array<{ title: string; beginner: string; technical: string }>;
};

type TutorialCardProps = {
  tutorial: TutorialDefinition;
  isCompleted: boolean;
  onToggleComplete: (id: string, value: boolean) => void;
};

export function TutorialCard({ tutorial, isCompleted, onToggleComplete }: TutorialCardProps) {
  return (
    <Panel title={tutorial.title} kicker="Beginner tutorial" icon="flow" accent="cyan">
      <p className="text-sm text-slate-200">{tutorial.beginner}</p>
      <p className="mt-2 text-xs text-command-muted">{tutorial.technical}</p>

      <div className="mt-3">
        <p className="text-xs uppercase tracking-[0.14em] text-cyan-300">Learn sequence</p>
        <ol className="mt-2 space-y-2">
          {tutorial.steps.map((step, index) => (
            <TutorialStep
              key={step.title}
              index={index + 1}
              title={step.title}
              beginner={step.beginner}
              technical={step.technical}
            />
          ))}
        </ol>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-xs text-command-muted">
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={(event) => onToggleComplete(tutorial.id, event.target.checked)}
          />
          Mark complete
        </label>
        <Link
          href={tutorial.tryNowHref}
          className="border border-cyan-400/40 bg-cyan-400/12 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-cyan-100"
        >
          {tutorial.tryNowLabel}
        </Link>
      </div>
    </Panel>
  );
}

