"use client";

type Props = {
  rawQuery: string;
  onChangeRawQuery: (next: string) => void;
  allowRaw: boolean;
  onRun: () => void;
  running: boolean;
  disabled: boolean;
};

export function SupabaseQueryEditor({ rawQuery, onChangeRawQuery, allowRaw, onRun, running, disabled }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs uppercase tracking-[0.16em] text-cyan-300">Raw SQL (optional)</label>
        <span className="text-[10px] text-command-muted">{allowRaw ? "enabled" : "preset-only"}</span>
      </div>
      <textarea
        value={rawQuery}
        onChange={(e) => onChangeRawQuery(e.target.value)}
        disabled={!allowRaw || running || disabled}
        rows={4}
        placeholder="SELECT ... (read-only only)"
        className="w-full border border-command-line/60 bg-black/30 p-2 text-xs text-slate-200"
      />
      <button
        type="button"
        onClick={onRun}
        disabled={running || disabled}
        className="border border-amber-400/35 bg-amber-400/10 px-3 py-2 text-xs uppercase tracking-[0.15em]"
      >
        {running ? "Running query..." : "Run selected query"}
      </button>
      {!allowRaw && (
        <p className="text-[11px] text-command-muted">
          Raw SQL is intentionally blocked in this environment. Use a preset for safe execution.
        </p>
      )}
    </div>
  );
}
