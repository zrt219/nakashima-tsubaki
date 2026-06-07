"use client";

type TutorialProgressProps = {
  total: number;
  completed: number;
  onReset: () => void;
};

export function TutorialProgress({ total, completed, onReset }: TutorialProgressProps) {
  const ratio = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="rounded border border-command-line/60 bg-black/30 p-3">
      <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Tutorial progress</p>
      <p className="mt-2 text-sm text-white">
        Completed {completed} of {total} tutorials ({ratio}%)
      </p>
      <div className="mt-2 h-2 w-full overflow-hidden bg-black/50">
        <div
          className="h-full bg-cyan-400/80"
          style={{ width: `${ratio}%` }}
        />
      </div>
      <button
        type="button"
        onClick={onReset}
        className="mt-3 border border-command-line/40 bg-command-line/10 px-2 py-1 text-[10px] uppercase tracking-[0.15em] text-slate-200"
      >
        Reset tutorial progress
      </button>
    </div>
  );
}

