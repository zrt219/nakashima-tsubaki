"use client";

type TutorialRecord = {
  id: string;
  title: string;
};

type TutorialChecklistProps = {
  items: TutorialRecord[];
  completed: Set<string>;
};

export function TutorialChecklist({ items, completed }: TutorialChecklistProps) {
  const completedCount = items.reduce((count, item) => (completed.has(item.id) ? count + 1 : count), 0);

  return (
    <div className="rounded border border-command-line/60 bg-black/20 p-3">
      <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Completion checklist</p>
      <ul className="mt-2 space-y-2 text-sm text-slate-200">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-2">
            <span
              className={`mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full ${
                completed.has(item.id) ? "bg-emerald-300" : "bg-command-line"
              }`}
            />
            <span>
              {item.title}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-command-muted">
        {completedCount} of {items.length} entries complete.
      </p>
    </div>
  );
}

