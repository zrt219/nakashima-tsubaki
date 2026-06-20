"use client";

type TutorialStepProps = {
  index: number;
  title: string;
  missionBrief: string;
  tacticalSpecs: string;
};

export function TutorialStep({ index, title, missionBrief, tacticalSpecs }: TutorialStepProps) {
  return (
    <li className="flex gap-3 text-sm">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-950 text-[10px] font-bold text-cyan-400">
        {index}
      </span>
      <div>
        <strong className="text-slate-200">{title}</strong>
        <p className="mt-0.5 text-slate-400">{missionBrief}</p>
        <p className="mt-1 font-mono text-[10px] text-command-muted/80">{tacticalSpecs}</p>
      </div>
    </li>
  );
}
