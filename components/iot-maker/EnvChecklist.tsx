"use client";

type EnvItem = {
  key: string;
  present: boolean;
  masked: string;
  required: string;
  serverOnly: boolean;
  description: string;
};

type Props = {
  entries: EnvItem[];
};

export function EnvChecklist({ entries }: Props) {
  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div
          key={entry.key}
          className={`grid gap-1 border border-command-line/60 p-3 text-xs md:grid-cols-[190px_1fr] ${entry.present ? "bg-emerald-900/10" : "bg-black/20"}`}
        >
          <p className="font-mono text-cyan-200/95">{entry.key}</p>
          <p className="text-slate-200">
            <span className={`font-semibold ${entry.present ? "text-emerald-300" : "text-amber-300"}`}>
              {entry.present ? "present" : "missing"}
            </span>{" "}
            / {entry.required} / {entry.serverOnly ? "server-only" : "client-visible"} / {entry.masked}
          </p>
          <p className="md:col-span-2 text-[11px] text-command-muted">{entry.description}</p>
        </div>
      ))}
    </div>
  );
}
