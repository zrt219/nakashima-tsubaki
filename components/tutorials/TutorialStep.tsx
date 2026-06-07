"use client";

type TutorialStepProps = {
  index: number;
  title: string;
  beginner: string;
  technical: string;
};

export function TutorialStep({ index, title, beginner, technical }: TutorialStepProps) {
  return (
    <li className="space-y-2 border border-command-line/45 bg-black/25 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300">
        Step {index} — {title}
      </p>
      <p className="text-sm text-slate-200">{beginner}</p>
      <p className="text-xs text-command-muted">
        Technical: {technical}
      </p>
    </li>
  );
}

