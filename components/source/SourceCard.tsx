type SourceCardProps = {
  title: string;
  url: string;
  claimSupported: string;
  limitation?: string;
  usageNotes?: string;
};

export function SourceCard({ title, url, claimSupported, limitation, usageNotes }: SourceCardProps) {
  return (
    <article className="border border-command-line/60 bg-black/30 p-3">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-1 text-[11px] text-cyan-300 break-all">{url}</p>
      <p className="mt-3 text-xs text-slate-200">
        <span className="text-cyan-300">Supports:</span> {claimSupported}
      </p>
      {usageNotes ? <p className="mt-2 text-xs text-command-muted">Use case: {usageNotes}</p> : null}
      {limitation ? (
        <p className="mt-2 border border-amber-400/25 bg-amber-400/6 p-2 text-xs text-amber-100">
          <span className="font-semibold">Limitation:</span> {limitation}
        </p>
      ) : null}
    </article>
  );
}
