"use client";

type ProofEntry = {
  id: string;
  runId: string;
  scenarioId?: string | null;
  network: string;
  evidenceHash: string;
  status: string;
  createdAt: string;
  transactionHash?: string | null;
  blockNumber?: number | null;
  ledgerIndex?: number | null;
};

type Props = {
  entries: ProofEntry[];
};

export function ProofTimeline({ entries }: Props) {
  if (!entries.length) {
    return (
      <div className="border border-command-line/60 bg-black/20 p-3 text-xs text-slate-300">
        No proof transactions yet. Run Command Flow to generate a record.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.slice(0, 8).map((entry) => (
        <div key={entry.id} className="border border-cyan-900/40 bg-black/20 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] uppercase tracking-[0.14em]">
            <span>{entry.network}</span>
            <span>{entry.createdAt}</span>
            <span className="font-mono text-cyan-300">{entry.status}</span>
          </div>
          <p className="mt-1 text-xs text-slate-300">runId: {entry.runId}</p>
          <p className="text-xs text-slate-300">scenario: {entry.scenarioId ?? "n/a"}</p>
          <p className="text-[11px] text-command-muted truncate">hash: {entry.evidenceHash}</p>
          {entry.transactionHash && (
            <p className="text-[11px] text-command-muted truncate">tx: {entry.transactionHash}</p>
          )}
          {entry.blockNumber !== undefined && entry.blockNumber !== null && (
            <p className="text-[11px] text-command-muted">block: {entry.blockNumber}</p>
          )}
          {entry.ledgerIndex !== undefined && entry.ledgerIndex !== null && (
            <p className="text-[11px] text-command-muted">ledger index: {entry.ledgerIndex}</p>
          )}
        </div>
      ))}
    </div>
  );
}
